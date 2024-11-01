/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';

const { Fill, Slot } = createSlotFill( 'TechnoteSpaceDropdownControls' );
const TechnoteSpaceDropdownControls = Fill;
TechnoteSpaceDropdownControls.Slot = Slot;

export default TechnoteSpaceDropdownControls;
