/**
 * WordPress dependencies
 */
import {
	applyFormat,
	registerFormatType,
	toggleFormat,
	replace,
	insert,
	slice,
	join,
} from '@wordpress/rich-text';
import { Fragment, useState } from '@wordpress/element';
import { ToolbarButton, Popover } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import RubyControl from './ruby-control';
import { TechnoteSpaceDropdownControls } from './dropdown/components';

const icon = (
	<svg viewBox="0 0 129.5 129.4" xmlns="http://www.w3.org/2000/svg">
		<path d="m18.8 129.3v-8.6h30.1v-14.8c-3.7 0-7.2-.1-10.8 0-3.2.1-6.4.2-9.6.3-1.1.1-1.5-.3-1.5-1.4.1-10.9.1-21.9 0-32.9 0-1.2.5-1.5 1.6-1.4 6.2.2 12.3.3 18.4.5h1.8v-12.9h-28.7v-8.7h89.4v8.7h-30v12.7c.6.1 1.1.1 1.7.1 6.4-.1 12.8-.3 19.2-.4 2-.1 1.9-.1 1.9 1.9v31.8c0 2 0 1.9-1.9 1.9-6.5-.1-13.1-.2-19.6-.3-.4 0-.8.1-1.3.1v14.8h31.2v8.5h-91.9zm74-31.2v-19.3h-13.4v19.3zm-43.9 0v-19.4h-12.6v19.4zm21.5-19.3h-12.6v19.2h12.7v-19.2zm.1 27.1h-12.7v14.8h12.7zm-12.7-47.9v12.9h12.6v-12.9z" />
		<path d="m61.2.2c-.3 2.2-.6 4.4-1 6.8 6.3-.3 12.1-1.7 18.1-3.1l1.2 5.1c-2.7.6-5.4 1.2-8.1 1.7-3.5.6-7 1-10.5 1.5-.8.1-1.1.3-1.1 1.2v4.1c2.3-.3 4.7-.6 7-1 .6-.1 1.2-.1 1.7-.1 2-.1 2.6-1.1 1.7-3-.1-.2-.1-.5-.1-.8 2.3-.3 4.2.9 6.3 1.5-.4 1-.7 2-1 2.7 1.7.8 3.4 1.6 5.1 2.6 8 5 9.2 17.8-.6 24.1-3.9 2.4-8.3 3.9-12.9 4.4l-2.3-4.9c2.2-.5 4.5-.9 6.7-1.6 2.7-.7 5.2-2.2 7.2-4.1 3.6-3.7 3.5-9.7-.3-13.3-1.1-1-2.4-1.8-3.9-2.3-.6-.2-1.1-.3-1.6.5-1.4 2.5-2.9 4.9-4.5 7.3-1.7 2.3-3.7 4.4-5.6 6.7l2 3.2-4.5 3.3-1.8-3c-1.5 1-3 2.1-4.5 3-2.4 1.5-5.1 2.5-8 2-3-.5-4.8-2.4-5.1-5.5-.4-4.5 1.4-8.3 4-11.8 2.3-3 5.2-5.5 8.6-7.3.8-.3 1.2-1.1 1.2-1.9-.1-1.9 0-3.8 0-5.8h-11.5v-5.1h11.7c.1-1.9.3-3.9.3-5.9 0-.4-.5-.8-.8-1.2zm-6.8 24.6c-1 .9-2.3 1.7-3.3 2.7-2.9 2.8-5 6.1-5.1 10.4-.1 1.9.7 2.4 2.5 2 2.9-.8 5.1-2.6 7.3-4.5.2-.3.3-.6.3-1-.4-3.2-1-6.3-1.7-9.6zm6.1 6.3.5.1c2.9-3.1 5.3-6.6 6.9-10.5-2.5.3-4.9.7-7.4 1.3-.4.2-.7.6-.8 1.1.3 2.8.6 5.4.8 8z" />
		<g fill="#fff">
			<path d="m92.8 98.1h-13.4v-19.3h13.4z" />
			<path d="m48.9 98.1h-12.6v-19.4h12.5z" />
			<path d="m70.4 78.8v19.2h-12.6v-19.2z" />
			<path d="m70.5 105.9v14.8h-12.7v-14.8z" />
			<path d="m57.8 58h12.6v12.9h-12.6z" />
			<path d="m54.4 24.8c.6 3.3 1.2 6.5 1.8 9.5.1.3-.1.7-.3 1-2.2 1.9-4.5 3.7-7.3 4.5-1.9.5-2.6-.1-2.5-2 .1-4.2 2.2-7.5 5.1-10.4 1-.9 2.2-1.8 3.2-2.6z" />
			<path d="m60.5 31.1c-.2-2.6-.5-5.3-.7-7.9.1-.5.3-.9.8-1.1 2.4-.6 4.9-1.1 7.4-1.4-1.7 3.9-4 7.4-6.9 10.5z" />
		</g>
	</svg>
);

const EditRuby = ( props ) => {
	let value = props.value;
	const selectedText = value.text.slice( value.start, value.end );
	const [ isRubyEditorOpen, setIsRubyEditorOpen ] = useState( false );
	const [ popoverAnchor ] = useState( props.contentRef.current );

	let targetText = '';
	let rubyText = '';
	if ( props.isActive ) {
		const regex =
			/(?<target>.*?)(\s\(|（)?(?=([ぁ-んァ-ヴ]+))(?<ruby>[ぁ-んァ-ヴ]+)(\)\s|）)?/g;
		let matches;
		while ( ( matches = regex.exec( selectedText ) ) !== null ) {
			targetText += matches.groups.target;
			rubyText += matches.groups.ruby;
		}
	} else {
		targetText = selectedText;
	}
	const rubyContents = {
		text: targetText,
		ruby: rubyText,
	};

	const onEditDone = ( inputValue ) => {
		setIsRubyEditorOpen( false );

		if ( inputValue && rubyContents.ruby !== inputValue ) {
			const newRubyContents = Object.assign( {}, rubyContents, {
				ruby: inputValue,
			} );
			const targetTextStart = value.start;
			let targetTextEnd = value.end;
			let isModified = false;

			// ルビを編集した場合の対応
			if ( rubyContents.ruby ) {
				targetTextEnd = targetTextEnd - rubyContents.ruby.length;
				isModified = true;
			}

			// rp要素対応
			let insertRubyText = newRubyContents.ruby;
			let rpLength = 0;
			const settingAddRp =
				simplified_japanese_params.add_rp === '1' ? true : false;
			if ( settingAddRp ) {
				insertRubyText = '（' + insertRubyText + '）';
				rpLength = 2;
			}

			// ルビ挿入と要素設定
			if ( isModified ) {
				const beforeValue = slice( value, 0, value.start );
				let targetValue = slice( value, value.start, value.end );
				const afterValue = slice( value, value.end, value.text.length );
				targetValue = replace(
					targetValue,
					selectedText,
					newRubyContents.text + insertRubyText
				);
				value = join( [ beforeValue, targetValue, afterValue ] );
			} else {
				value = insert( value, insertRubyText, value.end, value.end );
			}
			value = applyFormat(
				value,
				{
					type: 'alfasado/ruby',
				},
				targetTextStart,
				targetTextEnd + newRubyContents.ruby.length + rpLength
			);
			value = applyFormat(
				value,
				{
					type: 'alfasado/rt',
					attributes: {
						style:
							simplified_japanese_params.add_rt_style === '1'
								? 'font-size: 0.5em'
								: '',
					},
				},
				settingAddRp ? targetTextEnd + 1 : targetTextEnd,
				settingAddRp
					? targetTextEnd + newRubyContents.ruby.length + 1
					: targetTextEnd + newRubyContents.ruby.length
			);
			if ( settingAddRp ) {
				value = applyFormat(
					value,
					{
						type: 'alfasado/rp',
					},
					targetTextEnd,
					targetTextEnd + 1
				);
				value = applyFormat(
					value,
					{
						type: 'alfasado/rp',
					},
					targetTextEnd + newRubyContents.ruby.length + 1,
					targetTextEnd + newRubyContents.ruby.length + 2
				);
			}
		} else if ( ! inputValue && props.isActive ) {
			// removeFormatでは意図した動作にならなかった
			value = toggleFormat( value, {
				type: 'alfasado/ruby',
			} );
			value = replace( value, selectedText, targetText );
		}
		return props.onChange( value );
	};

	const rubyEditor = isRubyEditorOpen && (
		<Popover
			position="bottom center"
			noArrow={ false }
			anchor={ popoverAnchor }
			onClose={ () => setIsRubyEditorOpen( false ) }
		>
			<RubyControl
				onEditDone={ onEditDone }
				targetText={ targetText }
				value={ rubyContents.ruby }
			/>
		</Popover>
	);
	return (
		<>
			<TechnoteSpaceDropdownControls>
				<ToolbarButton
					icon={ icon }
					title={ __( 'Edit Ruby', 'simplified-japanese' ) }
					onClick={ () => {
						if ( rubyContents.text ) {
							setIsRubyEditorOpen( true );
						}
					} }
				/>
			</TechnoteSpaceDropdownControls>
			{ rubyEditor }
		</>
	);
};

export default function registerRubyFormats() {
	registerFormatType( 'alfasado/ruby', {
		title: 'Ruby',
		tagName: 'ruby',
		className: null,
		edit: EditRuby,
	} );

	registerFormatType( 'alfasado/rt', {
		title: 'Ruby Text',
		tagName: 'rt',
		className: null,
		attributes: {
			style: '',
		},
		edit() {
			return <Fragment></Fragment>;
		},
	} );

	registerFormatType( 'alfasado/rp', {
		title: 'Ruby Parentheses',
		tagName: 'rp',
		className: null,
		edit() {
			return <Fragment></Fragment>;
		},
	} );
}
