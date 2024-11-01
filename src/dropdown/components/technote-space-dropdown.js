/**
 * WordPress dependencies
 */
import { BlockFormatControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarDropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import TechnoteSpaceDropdownControls from './technote-space-dropdown-controls';

const icon = (
	<svg
		width="20"
		height="20"
		viewBox="0 0 741.563 840.19"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g transform="translate(-141.174 -91.408)">
			<path
				d="m491.125 667.265c12.978-.309 30.549 6.065 37.468 17.044 2.305 3.754 15.548 21.075 3.46 50.534-.578 1.443 2.018 1.443 3.461.577 11.241-6.927 38.045-26.847 52.74-36.089s10.085-6.64 24.787-15.3a120.86 120.86 0 0 1 27.382-12.125c11.528-3.467 30.549-.309 38.329 9.239 5.766 6.927 11.528 19.92 15.273 17.9 2.592-1.443 6.34-3.754 8.936-5.2 71.464-43.876 139.2-108.261 165.429-202.384 45.547-162.818-23.356-262.993-122.2-289.841-75.221-20.788-132.275 11.834-174.652 47.923-7.774 6.64-17.3 9.817-25.361 7.506-8.074-2.6-14.7-10.395-17.578-20.208-16.994-53.729-48.708-112.612-123.355-136.286-97.991-31.465-207.51 15.881-253.044 178.715-42.077 150.7 45.248 295.047 110.959 380.5.865 1.156 5.475 6.066 12.668 13.287a33.337 33.337 0 0 0 6.915 5.484 34.39 34.39 0 0 0 4.9 3.176c2.017 1.156 2.017 2.6 8.936-1.443a195.723 195.723 0 0 1 26.222-10.974 93.869 93.869 0 0 1 10.663-2.6c15.005-3.186 123.365-.3 157.662.565z"
				fill="#c42d54"
			/>
			<path
				d="m671.831 695.271c-11.241-13.286-32.858-10.972-47.543-.309-13.259 10.972-104.619 70.138-104.619 70.138l-109.516-2.308-.309.309a10.622 10.622 0 0 1 -9.8-11.259 10.4 10.4 0 0 1 10.677-10.116h.279l-.309-.309c19.6.309 80.7 1.73 80.7 1.73a30.333 30.333 0 0 0 1.156-60.625l-117.29-2.3c-73.2-1.443-97.126 29.446-123.352 55.428l-47.275 41a13.866 13.866 0 0 0 -4.9 10.682l-2.592 139.44a4.763 4.763 0 0 0 2.592 4.326 4.358 4.358 0 0 0 4.9-.578l91.385-77.632a13.861 13.861 0 0 1 11.525-2.888l139.781 29.156a36.44 36.44 0 0 0 28.244-5.775s181.28-124.715 194.826-135.686c12.393-11.825 12.668-29.147 1.44-42.424z"
				fill="#060001"
			/>
		</g>
	</svg>
);
const POPOVER_PROPS = {
	position: 'bottom left',
};
const TechnoteSpaceDropdown = () => (
	<BlockFormatControls>
		<div className="editor-format-toolbar">
			<ToolbarGroup>
				<TechnoteSpaceDropdownControls.Slot>
					{ ( fills ) => (
						<ToolbarDropdownMenu
							icon={ icon }
							hasArrowIndicator={ true }
							popoverProps={ POPOVER_PROPS }
							label={ __(
								'Simplified Japanese Functions',
								'simplified-japanese'
							) }
							controls={ fills.map( ( [ { props } ] ) => props ) }
						/>
					) }
				</TechnoteSpaceDropdownControls.Slot>
			</ToolbarGroup>
		</div>
	</BlockFormatControls>
);

export default TechnoteSpaceDropdown;
