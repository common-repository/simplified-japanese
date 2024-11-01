export const keyboardStatus = {
	isPressShiftKey: false,
	isPressOptKey: false,
};

const SHIFT = 16;
const ALT = 18; // Mac ... Opt

( () => {
	window.addEventListener( 'keydown', ( event ) => {
		const { keyCode } = event;
		if ( keyCode === SHIFT ) {
			keyboardStatus.isPressShiftKey = true;
		} else if ( keyCode === ALT ) {
			keyboardStatus.isPressOptKey = true;
		}
	} );
	window.addEventListener( 'keyup', () => {
		keyboardStatus.isPressShiftKey = false;
		keyboardStatus.isPressOptKey = false;
	} );
} )();
