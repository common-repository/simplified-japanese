/**
 * External dependencies
 */
import { css } from 'emotion';

/**
 * WordPress dependencies
 */
import { Button, TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import postData from './postdata';

function RubyControl( { onEditDone, targetText, value } ) {
	const formStyle = css`
		padding: 10px;
		min-width: 240px;
	`;
	const targetTextStyle = css`
		margin-bottom: 0.5rem;
		font-size: 1rem;
		font-weight: bold;
	`;
	const rubyTextStyle = css`
		margin-bottom: 1rem;
	`;
	const rubyTextSuggeting = css`
		color: #c00;
		font-size: 0.75rem;
	`;

	const [ inputValue, setInputValue ] = useState( value );
	const [ xhrDone, setXhrDone ] = useState(
		simplified_japanese_params.api_ready === '0' || value ? true : false
	);

	const onFormSubmit = ( event ) => {
		event.preventDefault();
		onEditDone( inputValue );
	};

	const resultElement = (
		<form onSubmit={ onFormSubmit } className={ formStyle }>
			<div className={ targetTextStyle }>{ targetText }</div>
			<div className={ rubyTextStyle }>
				<TextControl
					label={ __( 'Ruby Text', 'simplified-japanese' ) }
					value={ inputValue }
					onChange={ setInputValue }
				/>
				{ ! xhrDone && (
					<div className={ rubyTextSuggeting }>
						{ __(
							'Analyzing a candidate of furigana…',
							'simplified-japanese'
						) }
					</div>
				) }
			</div>
			<Button
				type="submit"
				children={ __( 'OK', 'simplified-japanese' ) }
				label={ __( 'OK', 'simplified-japanese' ) }
				className="button button-primary"
			/>
		</form>
	);

	// 伝えるウェブと通信
	if ( ! inputValue && ! xhrDone ) {
		const data = {
			action: 'simplified_japanese_get_phonetic',
			_wpnonce: window.simplified_japanese.wpnonce.get_phonetic,
			text: targetText,
			_type: 'insert_editor',
		};
		postData( ajaxurl, data )
			.then( ( response ) => {
				if ( response.status === 200 ) {
					setInputValue( response.result );
				}
			} )
			.finally( () => {
				setXhrDone( true );
			} );
	}
	return resultElement;
}

export default RubyControl;
