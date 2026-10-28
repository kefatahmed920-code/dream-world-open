/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InputState {
  moveForward: number; // -1 to 1
  moveRight: number; // -1 to 1
  sprint: boolean;
  jump: boolean;
  crouch: boolean;
  prone: boolean;
  interact: boolean;
  enterVehicle: boolean;
  openMap: boolean;
  pause: boolean;
  cameraRotateX: number; // delta yaw
  cameraRotateY: number; // delta pitch
}

export class InputManager {
  public keysHeld: Record<string, boolean> = {};
  public keysJustPressed: Record<string, boolean> = {};

  // Virtual Joystick & Touch state
  public touchMove: { x: number; y: number } = { x: 0, y: 0 };
  public touchCameraDelta: { x: number; y: number } = { x: 0, y: 0 };
  public virtualSprint = false;
  public virtualJump = false;
  public virtualCrouch = false;
  public virtualProne = false;
  public virtualInteract = false;
  public virtualDrive = false;
  public virtualMap = false;

  private isPointerLocked = false;
  private pointerDeltaX = 0;
  private pointerDeltaY = 0;

  constructor(canvasElement?: HTMLElement) {
    this.setupKeyboardListeners();
    if (canvasElement) {
      this.setupMouseListeners(canvasElement);
    }
  }

  private setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      if (!this.keysHeld[code]) {
        this.keysJustPressed[code] = true;
      }
      this.keysHeld[code] = true;

      // Prevent default scrolling for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysHeld[e.code] = false;
    });

    window.addEventListener('blur', () => {
      this.keysHeld = {};
      this.keysJustPressed = {};
    });
  }

  private setupMouseListeners(element: HTMLElement) {
    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    element.addEventListener('mousedown', (e) => {
      if (e.button === 0 || e.button === 2) {
        isMouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isMouseDown || this.isPointerLocked) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        this.pointerDeltaX += dx;
        this.pointerDeltaY += dy;
      }
    });

    window.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    // Prevent context menu on right click in game
    element.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  public getPointerLock(): boolean {
    return this.isPointerLocked;
  }

  public setTouchMove(x: number, y: number) {
    this.touchMove.x = x;
    this.touchMove.y = y;
  }

  public addTouchCameraDelta(dx: number, dy: number) {
    this.touchCameraDelta.x += dx;
    this.touchCameraDelta.y += dy;
  }

  /**
   * Consume and return unified frame input state
   */
  public pollInput(): InputState {
    // Keyboard axes
    let moveFwd = 0;
    let moveRt = 0;

    if (this.keysHeld['KeyW'] || this.keysHeld['ArrowUp']) moveFwd += 1;
    if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown']) moveFwd -= 1;
    if (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight']) moveRt += 1;
    if (this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft']) moveRt -= 1;

    // Blend touch joystick input
    if (Math.abs(this.touchMove.y) > 0.1) moveFwd -= this.touchMove.y;
    if (Math.abs(this.touchMove.x) > 0.1) moveRt += this.touchMove.x;

    // Clamp diagonal magnitude
    const len = Math.sqrt(moveFwd * moveFwd + moveRt * moveRt);
    if (len > 1) {
      moveFwd /= len;
      moveRt /= len;
    }

    const sprint = !!(this.keysHeld['ShiftLeft'] || this.keysHeld['ShiftRight'] || this.virtualSprint);
    const jump = !!(this.keysJustPressed['Space'] || this.virtualJump);
    const crouch = !!(this.keysJustPressed['KeyC'] || this.virtualCrouch);
    const prone = !!(this.keysJustPressed['KeyZ'] || this.virtualProne);
    const interact = !!(this.keysJustPressed['KeyE'] || this.virtualInteract);
    const enterVehicle = !!(this.keysJustPressed['KeyF'] || this.virtualDrive);
    const openMap = !!(this.keysJustPressed['KeyM'] || this.virtualMap);
    const pause = !!this.keysJustPressed['Escape'];

    // Camera rotation deltas
    const rotX = (this.pointerDeltaX + this.touchCameraDelta.x) * 0.0035;
    const rotY = (this.pointerDeltaY + this.touchCameraDelta.y) * 0.0035;

    // Reset per-frame edge triggers and deltas
    this.keysJustPressed = {};
    this.virtualJump = false;
    this.virtualCrouch = false;
    this.virtualProne = false;
    this.virtualInteract = false;
    this.virtualDrive = false;
    this.virtualMap = false;
    this.pointerDeltaX = 0;
    this.pointerDeltaY = 0;
    this.touchCameraDelta.x = 0;
    this.touchCameraDelta.y = 0;

    return {
      moveForward: moveFwd,
      moveRight: moveRt,
      sprint,
      jump,
      crouch,
      prone,
      interact,
      enterVehicle,
      openMap,
      pause,
      cameraRotateX: rotX,
      cameraRotateY: rotY,
    };
  }
}
