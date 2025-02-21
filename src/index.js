/**
 * WordPress dependencies
 */
import { registerFormatType } from '@wordpress/rich-text';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { createToolbarButton, getRichTextSetting } from './dropdown/utils';
import { SimplifiedJapanese } from './simplifed';
import { BreakWithClauses } from './break-with-clauses';
import { AddFurigana } from './furigana';
import registerRubyFormats from './edit-ruby';

const iconSimplifiedJapanese = (
	<svg viewBox="0 0 741.563 840.19" xmlns="http://www.w3.org/2000/svg">
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
const iconBreakWithClauses = (
	<svg viewBox="0 0 444 444" xmlns="http://www.w3.org/2000/svg">
		<path d="m343.2 254.1c-80.8 0-161.7 0-243.4 0v18.4 11c0 6.9-3.1 11.9-9.4 14.6-6.4 2.8-12 1-16.9-3.8-2.3-2.2-4.5-4.5-6.7-6.7-17.2-17.2-34.4-34.4-51.6-51.6-8.8-8.8-8.8-16.3-.2-25 19.4-19.5 38.9-38.9 58.3-58.4 5-5 10.9-6.7 17.3-3.8 6.2 2.7 9.2 7.9 9.1 14.8v17 12.2h243.9c.1-1.8.2-3.6.2-5.4 0-8.5-.1-17 .1-25.5.1-6.3 3.5-10.8 9.2-13.2 5.4-2.3 10.8-1.6 15.4 2.4 1 .9 2 1.8 2.9 2.7 19.1 19.1 38.2 38.2 57.3 57.3 8.4 8.4 8.4 16.2-.1 24.7-19.3 19.3-38.6 38.7-58 58-7.2 7.2-16.4 7.8-22.4.8-2.5-2.9-4-7.4-4.2-11.2-.6-9.3-.3-18.7-.4-28 .2-.4-.1-.7-.4-1.3z" />
	</svg>
);
const iconFurigana = (
	<svg viewBox="0 0 130 127.1" xmlns="http://www.w3.org/2000/svg">
		<path d="m116 117.9c-.7 4.6-3.5 6.9-7.2 8.1-4.5 1.5-9.3 1.5-13.8 0-4.3-1.4-6.7-4.3-7-8.6-.4-4.2 1.9-8.4 5.8-10.2 3.1-1.5 6.3-1.8 9.7-1.4.4.1.7.1 1.5.2-3.2-7.9-2-13.9 7.2-16.4l-.4-.3-8.8-.9 1.6-4.1c-2.8.5-5.5.9-8.2 1.5-.4.1-.8.8-1 1.3-3.7 9.6-8.6 18.7-14.5 27.1-.9 1.3-1.6 1.6-2.9.6-1.8-1.3-3.6-2.5-5.5-3.6-1.1-.7-1.3-1.3-.4-2.4 4.9-6.1 9-12.8 12.1-19.9.2-.5.4-1 .7-1.8-3.1.1-6.1.3-9 .4-2.2.1-2.2.1-2.3-2.2-.1-1.8 0-3.6-.1-5.4-.1-1.2.4-1.5 1.6-1.6 3.9-.2 7.8-.5 11.8-.7 1.1-.1 1.8-.4 2-1.7.5-2.8 1.3-5.7 1.9-8.6.3-1.3.7-1.7 2.1-1.4 2.2.5 4.5.9 6.8 1.1 1.2.1 1.5.7 1.2 1.8-.5 2.2-1.1 4.3-1.7 6.7 2-.5 3.8-.7 5.6-1.3 1.6-.5 2.3 0 2.4 1.6.1.6.2 1.2.4 1.8.5 2.6.5 2.6 3.2 2.8 5.9.5 11.6 2 17.1 4.4 1.3.6 1.5 1.2.9 2.4-.7 1.6-1.4 3.4-1.9 5.1-.4 1.2-.9 1.6-2.2 1.1-2.8-1-5.8-1-8.6-.1-3.1 1-4.3 2.8-3.4 6.1.7 2.5 1.5 4.9 2.4 7.3.2.5 1 1 1.6 1.3 4.1 2.4 8.1 4.7 12.2 7.1 1.3.7 1.3 1.5.3 2.7-1.4 1.7-2.8 3.4-4.1 5.2-.7 1.1-1.4 1.2-2.4.3-1.9-1.5-4.2-3.3-6.7-5.4zm-14.5-4.4c-.9.1-1.7.2-2.6.4-1.2.3-2.4 1.1-2.1 2.4.2.9 1.3 2.1 2.1 2.2 1.9.1 3.8 0 5.6-.4.7-.2 1.4-1.2 1.9-2 .5-.9.1-1.5-.8-1.8-1.4-.3-2.9-.5-4.1-.8z" />
		<path d="m14.6 91.1c-3 .4-5.8.7-8.5 1.1-1.6.3-2.2-.2-2.4-1.8-.2-1.8-.6-3.6-.9-5.5-.2-1.1 0-1.6 1.3-1.8 4.2-.4 8.4-.9 12.6-1.3.9 0 1.6-.6 1.8-1.4 1.4-4.1 2.8-8.2 4.1-12.3.4-1.2.9-1.6 2.2-1.2 2.1.6 4.3 1 6.3 1.5s2 .5 1.4 2.4c-1.1 3-2.2 6.1-3.4 9.3h2.6c7-.3 11.5 3.6 11.9 10.5.5 8.8-.3 17.4-2.9 25.8-.4 1.2-.9 2.4-1.5 3.6-2.1 4-5.4 6.1-10.1 5.7-2.2-.2-4.5-.6-6.6-1.1-.6-.2-1.1-.7-1.3-1.4-.3-3-.5-6.1-.8-9.3 1.6.4 3.1.8 4.7 1.1 4 .8 5.4 0 6.3-3.9.8-3.3 1.4-6.7 1.8-10.1.3-3 .4-5.9.4-8.9 0-2.1-.9-2.8-3-2.8-4.7-.1-4.7-.2-6.2 4.2-3.3 10.2-6.5 20.5-9.7 30.8-.5 1.5-1.1 1.9-2.6 1.4-2-.6-4-1.1-6.1-1.5-1.4-.3-1.8-.8-1.3-2.3 3.2-9.6 6.3-19.3 9.4-29 .1-.4.3-1 .5-1.8z" />
		<path d="m94.2 12.9c3.6-4.1 8.1-5.5 13.3-3.5 3.8 1.4 6.1 4.5 7.4 8.2 3 9.1 3.1 18.3-.4 27.2-2.9 7.3-9.1 11.3-16.1 14.3-3 1.3-5.1 1.1-7.2-1.5-1.4-1.7-3-3.1-4.7-4.7 2.4-.8 4.6-1.4 6.8-2.3 8.5-3.3 12.4-8.8 12.5-17.9.1-3.7-.1-7.4-.7-11.1-.8-4.9-4.7-5.9-8.2-2.5-3.8 3.7-5 8.4-4.7 13.5.2 2.4.7 4.6 1.4 6.9.3 1.2.1 1.8-1.1 2-2.1.4-4.2.9-6.2 1.5-1.1.3-1.8.1-2.4-1.1-2.1-4.9-2.7-10.4-1.8-15.7 1.1-6.6 2.4-13.1 3.6-19.7.3-1.6.4-3.2.6-4.9.1-1.1.5-1.8 1.8-1.6 2.3.3 4.6.4 6.9.5 1.4.1 1.7.6 1.4 1.8-.8 3.5-1.5 7.1-2.2 10.6z" />
		<path d="m27.5 15.2c-3.3-2.3-6.5-4.5-9.7-6.7-1.2-.8-1.2-1.5-.1-2.5 1.5-1.3 2.8-3 4.3-4.3.5-.4 1.2-.5 1.8-.2 5.9 3.8 12.6 6.3 19.6 7.4.5.3.9.7.9 1.3-.5 2.5-1 4.9-1.8 7.3-.3.5-.9.9-1.6.9-3.9-.1-6.9 1.6-9.5 4.3-2.4 2.6-2.3 4.2.5 6.4s5.7 4.1 8.2 6.4c4.2 3.8 5.5 8.7 3.8 14.1-1.2 4.1-4.7 5.9-8.5 6.9-4.5 1.1-8.9.6-13.4-.3-.7-.1-1.4-1-1.6-1.7-1-2.1-1.8-4.3-2.7-6.5-3.7 2.2-7.4 4.3-11 6.5-.4.3-.9.5-1.4.7-.5 0-1.4-.1-1.6-.5-1.4-2.4-2.6-4.7-3.8-7.1-.1-.5.1-1.1.4-1.4 6.1-3.5 12.2-6.9 18.3-10.4.1 0 .1 0 .3.1.7 2.6 1.7 5.3 2.2 8.1.1.9-.9 2-1.4 3 3.2.5 6.5 1.3 10.1.7 1.4-.3 2.6-.7 3-2.1.5-1.4-.1-2.6-1.1-3.5-2-1.8-4.1-3.4-6.1-5.3-1.6-1.3-3-2.8-4.4-4.4-2.6-3.3-2.9-6.4-.5-9.9 1.5-2.2 3.5-4 5.3-6 .6-.6 1-1 1.5-1.3z" />
		<path d="m65.3 99.6c-.2.3-.5.6-.8.9-2.4 1.4-4.9 2.8-7.3 4.2-1.1.7-1.4-.1-1.7-.9-1.7-3.8-3.2-7.8-5.1-11.5-1.6-2.8-3.4-5.5-5.3-8-.7-1-.7-1.5.3-2.2 1.9-1.1 3.7-2.3 5.5-3.5.5-.5 1.3-.5 1.7 0 .1.1.1.1.1.2 5.1 5.9 9.3 12.6 12.1 19.9.2.4.3.6.5.9z" />
		<path d="m44.4 31.2c2.8-1.1 5.5-2.3 8.2-3.4.3-.1 1.1.3 1.4.6 4.1 4 7 9 8.4 14.5.3.7 0 1.5-.7 1.9-.1 0-.1.1-.2.1-2.4 1.1-4.7 2.3-7.1 3.4-.8.4-1.4.4-1.6-.7-1.1-5.9-3.9-11.5-8.2-15.8.1 0-.1-.3-.2-.6z" />
		<path d="m48.1 70.6c1.1-.9 2.3-1.7 3.5-2.4.5-.1 1.1-.1 1.6.3 2 1.9 3.8 3.9 5.7 5.9.7.7.5 1.1-.2 1.8-3.2 2.6-3.2 2.6-5.9-.5-1.4-1.7-2.9-3.2-4.7-5.1z" />
		<path d="m65.6 70.7c-.1.3-.3.5-.5.8-2.8 2.7-3.2 2.7-5.7-.2-1.2-1.3-2.6-2.7-3.9-3.9-.7-.7-.9-1.1 0-1.7.1-.1.2-.1.3-.2 3.7-2.6 2.5-2.5 5.5.3 1.4 1.2 2.5 2.6 3.7 3.9.1.3.3.7.6 1z" />
	</svg>
);

const buttons = [];
if ( simplified_japanese_params.disp_btn_simplified === '1' ) {
	buttons.push( {
		name: 'simplified-japanese',
		create: createToolbarButton,
		setting: {
			icon: iconSimplifiedJapanese,
			title: __( 'Convert Simplified Japanese', 'simplified-japanese' ),
			tagName: 'x-alfasado-simplified-japanese',
			className: null,
			edit: SimplifiedJapanese,
		},
	} );
}
if ( simplified_japanese_params.disp_btn_break === '1' ) {
	buttons.push( {
		name: 'break-with-clauses',
		create: createToolbarButton,
		setting: {
			icon: iconBreakWithClauses,
			title: __( 'Break with Clauses', 'simplified-japanese' ),
			tagName: 'x-alfasado-break-with-clauses',
			className: null,
			edit: BreakWithClauses,
		},
	} );
}
if ( simplified_japanese_params.disp_btn_furigana === '1' ) {
	buttons.push( {
		name: 'add-furigana',
		create: createToolbarButton,
		setting: {
			icon: iconFurigana,
			title: __( 'Put on Furigana', 'simplified-japanese' ),
			tagName: 'x-alfasado-add-furigana',
			className: null,
			edit: AddFurigana,
		},
	} );
}

if ( buttons.length ) {
	buttons.forEach( ( { name, create, setting = {} }, index ) =>
		registerFormatType(
			...getRichTextSetting( { name, create, setting }, index )
		)
	);
	// Popoverがある都合で他のコード同様の扱いができずここで処理をする
	if ( simplified_japanese_params.disp_btn_ruby === '1' ) {
		registerRubyFormats();
	}
}
