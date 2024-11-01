/**
 * WordPress dependencies
 */
import { create, insert, toHTMLString } from '@wordpress/rich-text';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import postData from './postdata';

export const BreakWithClauses = ( props ) => {
	const value = props.value;
	const text = value.text;
	const selectedText = text.slice( value.start, value.end );
	const selectedTextFormats = value.formats.slice( value.start, value.end );
	const selectedTextReplacements = value.replacements.slice(
		value.start,
		value.end
	);

	if (
		selectedTextReplacements.filter( ( item ) => typeof item === 'object' )
			.length > 0
	) {
		window.alert(
			__(
				'The processing could not be executed. Please try narrowing down the selection range of sentences.',
				'simplified-japanese'
			)
		);
	} else if ( selectedText ) {
		const selectedTextData = {};
		selectedTextData.value = {
			formats: selectedTextFormats,
			text: selectedText.replace( /\u2028/g, '\u3013' ),
			start: 0,
			end: selectedText.length,
		};
		const html = toHTMLString( selectedTextData );

		const data = {
			action: 'simplified_japanese_helper',
			_wpnonce: window.simplified_japanese.wpnonce.helper,
			text: html,
			break_with_clauses: 1,
			_type: 'insert_editor',
		};
		postData( ajaxurl, data ).then( ( response ) => {
			if ( response.messages ) {
				let message = '';
				response.messages.forEach( ( item ) => {
					if ( message ) {
						message += '\n';
					}
					message += item;
				} );
				window.alert( message );
			} else {
				const result = response.result.replace( /\u3013/g, '\u2028' );
				const el = create( { html: result } );
				props.onChange( insert( props.value, el ) );
			}
		} );
	} else {
		window.alert( __( 'No text selected', 'simplified-japanese' ) );
	}
};
