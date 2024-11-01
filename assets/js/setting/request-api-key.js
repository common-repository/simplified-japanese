/* global jQuery */
( function ( $ ) {
	$( function () {
		const $clientId = $( '#tsutaeru_client_id' );
		const $clientSecret = $( '#tsutaeru_client_secret' );
		if ( $clientId.val() && $clientSecret.val() ) {
			$( '#request_tsutaeru_api_key' ).prop( 'disabled', true );
		}

		$( '#request_tsutaeru_api_key' ).on( 'click', function () {
			const email = $( '#tsutaeru_email' ).val();
			if ( ! email ) {
				window.alert(
					'伝えるウェブのAPIキー申請に利用するE-mailアドレスを入力してください。'
				);
				return false;
			}

			const xhr = $.ajax( ajaxurl, {
				type: 'post',
				data: {
					action: 'simplified_japanese_request_api_key',
					_wpnonce:
						window.simplified_japanese.wpnonce.request_api_key,
					email,
				},
				dataType: 'json',
			} );
			xhr.done( function ( response ) {
				$clientId.val( response.result.id );
				$clientSecret.val( response.result.secret );
				$( '#success_request_api_key' ).prop( 'hidden', false );
				$( '#request_tsutaeru_api_key' ).prop( 'disabled', true );
				$( '#submit' ).click();
			} ).fail( function () {
				const json = JSON.parse( xhr.responseText );
				window.alert( 'エラーが発生しました： ' + json.result.message );
			} );
		} );
	} );
} )( jQuery );
