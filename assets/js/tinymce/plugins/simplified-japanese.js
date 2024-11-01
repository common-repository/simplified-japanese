(function( $, document, window ) {
	tinymce.create(
		'tinymce.plugins.SimplifiedJapanese',
		{
			init: function(ed) {
				let is_press_shift_key  = false;
				let is_press_opt_key    = false;

				const _open_ruby_dialog = function( html, ruby ) {
					ed.windowManager.open( {
						title: window.simplified_japanese_classic_params.text.text_ruby,
						width : 420,
						height: 120,
						body: [
							{
								type: 'textbox',
								label: window.simplified_japanese_classic_params.text.text_text,
								name: 'html',
								value: html
							},
							{
								type: 'textbox',
								label: window.simplified_japanese_classic_params.text.text_ruby,
								name: 'ruby',
								value: ruby
							},
						],
						onsubmit: function(e) {
							let content = '';
							const editor = tinymce.activeEditor;
							if (e.data.ruby) {
								let rt_tag = '<rt>';
								if ( window.simplified_japanese_classic_params.settings.add_rp === '1' ) {
									content = '<ruby>' + e.data.html + '<rp> (</rp>' + rt_tag + e.data.ruby + '</rt><rp>) </rp></ruby>';
								} else {
									content = '<ruby>' + e.data.html + rt_tag + e.data.ruby + '</rt></ruby>';
								}
								editor.insertContent( content );
							} else {
								editor.insertContent( e.data.html );
							}
						}
					} );
				};

				const _showErrorMessage = function ( messages ) {
					let message = '';
					messages.forEach( function ( item ) {
						if ( message ) {
							message += '\n';
						}
						message += item;
					} );
					window.alert( message );
				};

				ed.on('keyDown', function(e) {
					if ( e.keyCode == 16 ) {
						is_press_shift_key = true;
					} else if ( e.keyCode == 18 ) {
						is_press_opt_key = true;
					}
				});

				ed.on('keyUp', function(e) {
					is_press_shift_key  = false;
					is_press_opt_key    = false;
				});

				ed.on('click', function(e) {
					is_press_shift_key  = false;
					is_press_opt_key    = false;
				});

				if ( window.simplified_japanese_classic_params.settings.disp_btn_simplified === 1 ) {
					ed.addButton(
						'pt-simplified-japanese',
						{
							title: window.simplified_japanese_classic_params.text.btn_simplified,
							image: window.simplified_japanese_classic_params.plugin_dir + '/assets/img/simplified_japanese.svg',
							cmd: 'simplified_japanese'
						}
					);
				}

				if ( window.simplified_japanese_classic_params.settings.disp_btn_break === 1 ) {
					ed.addButton(
						'pt-break-with-clauses',
						{
							title: window.simplified_japanese_classic_params.text.btn_break,
							image: window.simplified_japanese_classic_params.plugin_dir + '/assets/img/break_with_clauses.svg',
							cmd: 'break_with_clauses'
						}
					);
				}

				if ( window.simplified_japanese_classic_params.settings.disp_btn_furigana === 1 ) {
					ed.addButton(
						'pt-furigana',
						{
							title: window.simplified_japanese_classic_params.text.btn_furigana,
							image: window.simplified_japanese_classic_params.plugin_dir + '/assets/img/insert_furigana.svg',
							cmd: 'furigana'
						}
					);
				}

				if ( window.simplified_japanese_classic_params.settings.disp_btn_ruby === 1 ) {
					ed.addButton(
						'pt-ruby',
						{
							title: window.simplified_japanese_classic_params.text.btn_ruby,
							image: window.simplified_japanese_classic_params.plugin_dir + '/assets/img/ruby.svg',
							cmd: 'ruby'
						}
					);
				}

				ed.addCommand( 'simplified_japanese', function() {
					const editor = tinymce.activeEditor;
					const html = editor.selection.getContent();
					if ( ! html ) {
						alert( window.simplified_japanese_classic_params.text.no_text_selected );
						return;
					}
					const messenger = editor.notificationManager.open({
						text: window.simplified_japanese_classic_params.text.text_xhr_running,
						type: 'info',
					});
					const xhr = $.ajax( {
						type: 'post',
						url: ajaxurl,
						dataType: 'json',
						timeout: 10000,
						data: {
							'action': 'simplified_japanese_helper',
							'_wpnonce': window.simplified_japanese.wpnonce.helper,
							'text': html,
							'simplified_japanese': 1,
							'_type': 'insert_editor',
							'shift_key' : is_press_shift_key,
							'option_key' : is_press_opt_key,
						}
					} );
					xhr.then(
						function( response ) {
							messenger.close();
							if ( response.messages ) {
								_showErrorMessage( response.messages );
							} else {
								editor.insertContent( response.result );
							}
						},
						function( jqXHR ) {
							messenger.close();
							if ( jqXHR.responseJSON.messages ) {
								_showErrorMessage( jqXHR.responseJSON.messages );
								return;
							}
							alert( window.simplified_japanese_classic_params.text.xhr_error_simplified );
						}
					);
				});

				ed.addCommand( 'break_with_clauses', function () {
					const editor = tinymce.activeEditor;
					const html = editor.selection.getContent();
					if ( ! html ) {
						alert( window.simplified_japanese_classic_params.text.no_text_selected );
						return;
					}
					const messenger = editor.notificationManager.open({
						text: window.simplified_japanese_classic_params.text.text_xhr_running,
						type: 'info',
					});
					const xhr = $.ajax( {
						type: 'post',
						url: ajaxurl,
						data: {
							'action': 'simplified_japanese_helper',
							'_wpnonce': window.simplified_japanese.wpnonce.helper,
							'text': html,
							'break_with_clauses': 1,
							'_type': 'insert_editor',
							'shift_key' : is_press_shift_key,
						}
					} );
					xhr.then(
						function( response ) {
							messenger.close();
							if ( response.messages ) {
								_showErrorMessage( response.messages );
							} else {
								editor.insertContent( response.result );
							}
						},
						function( jqXHR ) {
							messenger.close();
							if ( jqXHR.responseJSON.messages ) {
								_showErrorMessage( jqXHR.responseJSON.messages );
								return;
							}
							alert( window.simplified_japanese_classic_params.text.xhr_error_break_with_clauses );
						}
					);
				});

				ed.addCommand( 'furigana', function () {
					const editor = tinymce.activeEditor;
					const html = editor.selection.getContent();
					if ( ! html ) {
						alert( window.simplified_japanese_classic_params.text.no_text_selected );
						return;
					}
					const messenger = editor.notificationManager.open({
						text: window.simplified_japanese_classic_params.text.text_xhr_running,
						type: 'info',
					});
					const xhr = $.ajax( {
						type: 'post',
						url: ajaxurl,
						data: {
							'action': 'simplified_japanese_helper',
							'_wpnonce': window.simplified_japanese.wpnonce.helper,
							'text': html,
							'_type': 'insert_editor',
							'shift_key' : is_press_shift_key,
						}
					} );
					xhr.then(
						function( response ) {
							messenger.close();
							if ( response.messages ) {
								_showErrorMessage( response.messages );
							} else {
								editor.insertContent( response.result );
							}
						},
						function( jqXHR ) {
							messenger.close();
							if ( jqXHR.responseJSON.messages ) {
								_showErrorMessage( jqXHR.responseJSON.messages );
								return;
							}
							alert( window.simplified_japanese_classic_params.text.xhr_error_furigana );
						}
					);
				});

				ed.addCommand( 'ruby', function () {
					const editor = tinymce.activeEditor;
					const html = editor.selection.getContent();
					if ( ! html ) {
						alert( window.simplified_japanese_classic_params.text.no_text_selected );
						return;
					}
					const rubyCount = ( html.match( new RegExp( '<ruby>', 'g' ) ) || [] ).length;
					if ( rubyCount === 1 ) {
						const matches = /^<ruby>([^<]+)(<rp>（<\/rp>)?<rt[^>]*>([^<]+).*$/.exec( html );
						if ( matches[1] && matches[3] ) {
							_open_ruby_dialog( matches[1], matches[3] );
						}
					} else {
						if ( window.simplified_japanese_classic_params.api_ready === '1' ) {
							const messenger = editor.notificationManager.open({
								text: window.simplified_japanese_classic_params.text.text_xhr_running,
								type: 'info',
							});
							const xhr = $.ajax( {
								type: 'post',
								url: ajaxurl,
								data: {
									'action': 'simplified_japanese_get_phonetic',
									'_wpnonce': window.simplified_japanese.wpnonce.get_phonetic,
									'text': html,
									'_type': 'insert_editor',
								}
							} );
							xhr.then(
								function( response ) {
									messenger.close();
									if ( response.status === 200 ) {
										_open_ruby_dialog( response.text, response.result );
									} else {
										_open_ruby_dialog( html, '' );
									}
								},
								function() {
									messenger.close();
									_open_ruby_dialog( html, '' );
								}
							);
						} else {
							_open_ruby_dialog( html, '' );
						}
					}
				});
			}
		}
	);
	tinymce.PluginManager.add( 'simplified_japanese', tinymce.plugins.SimplifiedJapanese );
})( jQuery, document, window );
