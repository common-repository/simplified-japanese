<?php
/**
 * Plugin Name: Simplified Japanese
 * Plugin URI: https://tsutaeru.cloud/plugins/wordpress.html
 * Description: Support the creation of easy Japanese.
 * Author: Alfasado Inc.
 * Version: 1.0.4
 * Requires at least: 5.0
 * Requires PHP: 5.6
 * Author URI: https://alfasado.net
 * Text Domain: simplified-japanese
 * Domain Path: /languages/
 */

namespace Simplified_Japanese;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Invalid request.' );
}

define( 'SIMPLIFIED_JAPANESE__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
require_once SIMPLIFIED_JAPANESE__PLUGIN_DIR . 'class.tsutaeru-web.php';

class Simplified_Japanese {
	private function __construct() {}

	public static function init() {
		add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), array( __CLASS__, 'add_settings_link' ) );
		add_filter( 'mce_external_plugins', array( __CLASS__, 'add_buttons' ) );
		add_filter( 'mce_buttons', array( __CLASS__, 'register_buttons' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'add_plugin_data' ), 100 );
		add_action( 'wp_ajax_simplified_japanese_request_api_key', array( __CLASS__, 'proxy_request_api_key' ) );
		add_action( 'wp_ajax_simplified_japanese_helper', array( __CLASS__, 'proxy_simplified_japanse_helper' ) );
		add_action( 'wp_ajax_simplified_japanese_get_phonetic', array( __CLASS__, 'proxy_get_phonetic' ) );

		// Gutenberg
		if ( 5.2 <= floatval( get_bloginfo( 'version' ) ) ) {
			add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'load_gutenberg_scripts' ) );
			$asset_file = include plugin_dir_path( __FILE__ ) . 'assets/js/gutenberg/simplified-japanese.asset.php';
			wp_register_script(
				'simplified-japanese-js',
				plugins_url( 'assets/js/gutenberg/simplified-japanese.js', __FILE__ ),
				$asset_file['dependencies'],
				$asset_file['version'],
				false
			);
			wp_set_script_translations( 'simplified-japanese-js', 'simplified-japanese', plugin_dir_path( __FILE__ ) . 'languages' );
		}
	}

	public static function on_plugins_loaded() {
		load_plugin_textdomain(
			'simplified-japanese',
			false,
			dirname( plugin_basename( __FILE__ ) ) . '/languages'
		);
		add_action( 'admin_menu', array( __CLASS__, 'add_plugin_setting_page' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'add_plugin_setting_page_script' ) );
	}

	public static function add_settings_link( $links ) {
		$url = admin_url( 'options-general.php?page=simplified_japanese' );
		// Prevent warnings in PHP 7.0+ when a plugin uses this filter incorrectly.
		$links = (array) $links;
		$links[] = sprintf( '<a href="%s">%s</a>', $url, __( 'Settings' ) );
		return $links;
	}

	public static function load_gutenberg_scripts() {
		wp_enqueue_script( 'simplified-japanese-js' );
		$option_values = get_option( 'simplified_japanese_settings' );
		$selected_buttons = isset( $option_values['buttons'] ) ? $option_values['buttons'] : array();
		$disp_btn_simplified = in_array( 'simplified-japanese', $selected_buttons, true ) ? 1 : 0;
		$disp_btn_break = in_array( 'break-with-clauses', $selected_buttons, true ) ? 1 : 0;
		$disp_btn_furigana = in_array( 'furigana', $selected_buttons, true ) ? 1 : 0;
		$disp_btn_ruby = in_array( 'ruby', $selected_buttons, true ) ? 1 : 0;
		$api_ready = $option_values['tsutaeru_client_id'] && $option_values['tsutaeru_client_secret'] ? 1 : 0;
		wp_localize_script(
			'simplified-japanese-js',
			'simplified_japanese_params',
			array(
				'disp_btn_simplified' => $disp_btn_simplified,
				'disp_btn_break'      => $disp_btn_break,
				'disp_btn_furigana'   => $disp_btn_furigana,
				'disp_btn_ruby'       => $disp_btn_ruby,
				'add_rp'              => isset( $option_values['add_rp'] ) ? $option_values['add_rp'] : 0,
				'api_ready'           => $api_ready,
			)
		);
	}

	public static function add_buttons( $plugin_array ) {
		$mce_plugin_path = plugins_url() . '/' . dirname( plugin_basename( __FILE__ ) ) .
			'/assets/js/tinymce/plugins/simplified-japanese.js';
		$plugin_array['simplified_japanese'] = $mce_plugin_path;
		return $plugin_array;
	}

	public static function register_buttons( $buttons ) {
		array_push( $buttons, 'pt-simplified-japanese', 'pt-break-with-clauses', 'pt-furigana', 'pt-ruby' );
		return $buttons;
	}

	public static function add_plugin_data() {
		$plugin_dir = plugins_url() . '/' . dirname( plugin_basename( __FILE__ ) );
		$nonce_simplified_japanese_request_api_key = wp_create_nonce( 'simplified_japanese_request_api_key' );
		$nonce_simplified_japanese_helper = wp_create_nonce( 'simplified_japanese_helper' );
		$nonce_simplified_japanese_get_phonetic = wp_create_nonce( 'simplified_japanese_get_phonetic' );
		$btn_simplified = __( 'Convert Simplified Japanese', 'simplified-japanese' );
		$btn_break = __( 'Break with Clauses', 'simplified-japanese' );
		$btn_furigana = __( 'Put on Furigana', 'simplified-japanese' );
		$btn_ruby = __( 'Edit Ruby', 'simplified-japanese' );
		$no_text_selected = __( 'No text selected', 'simplified-japanese' );
		$xhr_error_simplified = __( 'An error occurred while translating to Simplified Japanese.', 'simplified-japanese' );
		$xhr_error_break_with_clauses = __( 'An error occurred while Break with Clauses.', 'simplified-japanese' );
		$xhr_error_furigana = __( 'An error occurred while put on furigana.', 'simplified-japanese' );
		$text_ruby = __( 'Ruby', 'simplified-japanese' );
		$text_text = __( 'Text', 'simplified-japanese' );
		$text_xhr_running = __( 'Processing simplified japanese plugin...', 'simplified-japanese' );
		$option_values = get_option( 'simplified_japanese_settings' );
		$selected_buttons = isset( $option_values['buttons'] ) ? $option_values['buttons'] : array();
		$disp_btn_simplified = in_array( 'simplified-japanese', $selected_buttons, true ) ? 1 : 0;
		$disp_btn_break = in_array( 'break-with-clauses', $selected_buttons, true ) ? 1 : 0;
		$disp_btn_furigana = in_array( 'furigana', $selected_buttons, true ) ? 1 : 0;
		$disp_btn_ruby = in_array( 'ruby', $selected_buttons, true ) ? 1 : 0;
		$api_ready = $option_values['tsutaeru_client_id'] && $option_values['tsutaeru_client_secret'] ? 1 : 0;

		echo "<script>\n";
		echo "    window.simplified_japanese = simplified_japanese = {};\n";
		echo "    simplified_japanese.wpnonce = {\n";
		echo '        "request_api_key": "' . esc_js( $nonce_simplified_japanese_request_api_key ) . "\",\n";
		echo '        "helper": "' . esc_js( $nonce_simplified_japanese_helper ) . "\",\n";
		echo '        "get_phonetic": "' . esc_js( $nonce_simplified_japanese_get_phonetic ) . "\"\n";
		echo "    };\n";
		echo "</script>\n";

		$data = array(
			'plugin_dir' => $plugin_dir,
			'text'       => array(
				'btn_simplified'               => $btn_simplified,
				'btn_break'                    => $btn_break,
				'btn_furigana'                 => $btn_furigana,
				'btn_ruby'                     => $btn_ruby,
				'no_text_selected'             => $no_text_selected,
				'xhr_error_simplified'         => $xhr_error_simplified,
				'xhr_error_break_with_clauses' => $xhr_error_break_with_clauses,
				'xhr_error_furigana'           => $xhr_error_furigana,
				'text_ruby'                    => $text_ruby,
				'text_text'                    => $text_text,
				'text_xhr_running'             => $text_xhr_running,
			),
			'settings'   => array(
				'disp_btn_simplified' => $disp_btn_simplified,
				'disp_btn_break'      => $disp_btn_break,
				'disp_btn_furigana'   => $disp_btn_furigana,
				'disp_btn_ruby'       => $disp_btn_ruby,
				'add_rp'              => isset( $option_values['add_rp'] ) ? $option_values['add_rp'] : 0,
			),
			'api_ready'  => $api_ready,
		);
		wp_localize_script(
			'editor',
			'simplified_japanese_classic_params',
			$data
		);
	}

	private static function response_json( $status, $data, $message = null ) {
		if ( $data ) {
			if ( is_array( $data ) ) {
				$response_data = array_merge(
					array( 'status' => $status ),
					$data
				);
			} else {
				$response_data = array(
					'status' => $status,
					'result' => $data ? $data : null,
				);
			}
		} elseif ( $message ) {
			$response_data = array(
				'status'   => $status,
				'messages' => is_array( $message ) ? $message : array( $message ),
			);
		} else {
			// FIXME: 本来はここで$statusを上書きする必要はないはず
			$status = 500;
			$response_data = array(
				'status'   => 500,
				'messages' => array( __( 'No data to return.', 'simplified-japanese' ) ),
			);
		}
		header( 'Content-type: application/json' );
		http_response_code( $status );
		echo wp_json_encode( $response_data );
	}

	public static function proxy_request_api_key() {
		if ( ! wp_verify_nonce( $_POST['_wpnonce'], 'simplified_japanese_request_api_key', 'simplified-japanese' ) ) {
			self::response_json( 403, null, __( 'Invalid Access.', 'simplified-japanese' ) );
			die();
		}

		$admin_url = network_admin_url() . 'index.php';
		$api_key = hash( 'sha256', $admin_url );
		$site_name = get_bloginfo( 'name' );
		$email = isset( $_POST['email'] ) ? sanitize_email( $_POST['email'] ) : null;
		$tsutaeru_web = new Tsutaeru_Web();
		$result = $tsutaeru_web->request_secret_key( $api_key, $site_name, $email );
		$result->id = $api_key;
		self::response_json( $result->status, $result );
		die();
	}

	public static function proxy_simplified_japanse_helper() {
		if ( ! wp_verify_nonce( $_POST['_wpnonce'], 'simplified_japanese_helper', 'simplified-japanese' ) ) {
			self::response_json( 403, null, __( 'Invalid Access.', 'simplified-japanese' ) );
			die();
		}

		$plugin_setting_values = get_option( 'simplified_japanese_settings' );
		$client_id = isset( $plugin_setting_values['tsutaeru_client_id'] ) ? $plugin_setting_values['tsutaeru_client_id'] : null;
		$client_secret = isset( $plugin_setting_values['tsutaeru_client_secret'] ) ? $plugin_setting_values['tsutaeru_client_secret'] : null;
		$text = isset( $_POST['text'] ) ? wp_kses_post( $_POST['text'] ) : null;
		if ( ! $text ) {
			self::response_json( 200, null, __( 'No text selected.', 'simplified-japanese' ) );
			die();
		}

		// JSONにしたときダブルクオートが「\"」変換されてしまう
		$text = preg_replace( '/\\\(?=")/', '', $text );

		$arg = 1;
		$simplified = isset( $_POST['simplified_japanese'] ) ? true : false;
		$break_with_clauses = isset( $_POST['break_with_clauses'] ) ? true : false;
		$shift_key = isset( $_POST['shift_key'] ) ? ( 'true' === $_POST['shift_key'] ? true : false ) : false;
		$option_key = isset( $_POST['option_key'] ) ? ( 'true' === $_POST['option_key'] ? true : false ) : false;
		if ( $break_with_clauses ) {
			$arg = 3;
		} elseif ( ! $simplified ) {
			$split_in_editor = isset( $plugin_setting_values['split_in_editor'] ) ? $plugin_setting_values['split_in_editor'] : false;
			if ( $split_in_editor ) {
				$arg = $shift_key ? 1 : 2;
			} else {
				$arg = $shift_key ? 2 : 1;
			}
		} else {
			$split_in_editor = isset( $plugin_setting_values['split_in_editor_s'] ) ? $plugin_setting_values['split_in_editor_s'] : false;
			if ( $split_in_editor ) {
				$arg = $shift_key ? 1 : 2;
			} else {
				$arg = $shift_key ? 2 : 1;
			}
			$ruby_in_editor = isset( $plugin_setting_values['ruby_in_editor_s'] ) ? $plugin_setting_values['ruby_in_editor_s'] : false;
			if ( $option_key ) {
				$ruby_in_editor = $ruby_in_editor ? false : true;
			}
			if ( ! $ruby_in_editor ) {
				$arg = 6;
			}
			if ( $shift_key && 6 === $arg && ! $split_in_editor ) {
				$arg = 3;
			} elseif ( ! $shift_key && 6 === $arg && $split_in_editor ) {
				$arg = 3;
			}
		}
		$tsutaeru_web = new Tsutaeru_Web();
		list( $text_converted, $status, $error_messages ) = $tsutaeru_web->filter_furigana( $text, $arg, $simplified );
		$text_converted = preg_replace( '/<\/?rb>/', '', $text_converted );  // rb要素はHTML Standardで定義されていない
		self::response_json( $status, $text_converted, $error_messages );
		die();
	}

	public static function proxy_get_phonetic() {
		if ( ! wp_verify_nonce( $_REQUEST['_wpnonce'], 'simplified_japanese_get_phonetic' ) ) {
			self::response_json( 403, null, __( 'Invalid Access.', 'simplified-japanese' ) );
			die();
		}
		$allowed_html = array(
			'ruby' => array(),
			'rt'   => array(),
			'rp'   => array(),
		);
		$text = isset( $_POST['text'] ) ? trim( wp_kses( $_POST['text'], $allowed_html ) ) : null;
		$phonetic = '';
		if ( stripos( $text, '<ruby' ) === 0 && preg_match( '/<\/ruby>$/', $text ) ) {
			libxml_use_internal_errors( true );
			$html = '<html><body>' . $text;
			$dom  = new \DomDocument();
			if ( $dom->loadHTML(
				mb_convert_encoding( $html, 'HTML-ENTITIES', 'utf-8' ),
				LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_COMPACT
			) ) {
				$elements = $dom->getElementsByTagName( 'ruby' );
				$source = '';
				if ( $elements->length ) {
					for ( $i = 0; $i < $elements->length; $i++ ) {
						$element = $elements->item( $i );
						// phpcs:disable
						$source .= $element->firstChild->nodeValue;
						// phpcs:enable
					}
				}
				if ( $source ) {
					$text = $source;
				}
				$elements = $dom->getElementsByTagName( 'rt' );
				$ruby = '';
				if ( $elements->length ) {
					for ( $i = 0; $i < $elements->length; $i++ ) {
						$element = $elements->item( $i );
						// phpcs:disable
						$ruby .= $element->firstChild->nodeValue;
						// phpcs:enable
					}
				}
				if ( $ruby ) {
					$phonetic = $ruby;
				}
			}
		}
		if ( $phonetic ) {
			self::response_json(
				200,
				array(
					'text'   => $text,
					'result' => $phonetic,
				)
			);
			die();
		} elseif ( $text ) {
			$tsutaeru_web = new Tsutaeru_Web();
			list( $phonetic, $status, $error_messages ) = $tsutaeru_web->get_phonetic( $text );
			if ( 200 === $status ) {
				self::response_json(
					$status,
					array(
						'text'   => $text,
						'result' => $phonetic,
					)
				);
				die();
			} else {
				self::response_json( $status, null, $error_messages );
				die();
			}
		}

		self::response_json(
			200,
			array(
				'text'   => $text,
				'result' => '',
			)
		);
		die();
	}

	private static function set_default_value( $id, $default_value ) {
		$option_values = get_option( 'simplified_japanese_settings' );
		$target_option_value = isset( $option_values[ $id ] ) ? $option_values[ $id ] : null;
		$is_initialized = isset( $option_values['is_initialized'] ) ? true : false;
		if ( $is_initialized ) {
			return $target_option_value;
		}
		return $default_value;
	}

	public static function plugin_settings_page_html() {
		echo '<div class="wrap">' .
				'<h1>' . esc_html__( 'Settings for simplified japanese plugin', 'simplified-japanese' ) . '</h1>' .
				'<form method="post" action="options.php" novalidate="novalidate">';
		settings_fields( 'plugin_settings_page' );
		do_settings_sections( 'plugin_settings_page' );
		submit_button();
		echo '</form></div>';
	}

	public static function add_plugin_setting_page() {
		add_action(
			'admin_init',
			function () {
				register_setting(
					'plugin_settings_page',
					'simplified_japanese_settings',
					array( __CLASS__, 'sanitize' )
				);

				// エディタ設定
				add_settings_section(
					'simplified_japanese_setting_editor',
					__( 'Editor Settings', 'simplified-japanese' ),
					null,
					'plugin_settings_page'
				);
				add_settings_field(
					'buttons',
					__( 'Buttons to display', 'simplified-japanese' ),
					function () {
						$option_values = get_option( 'simplified_japanese_settings' );
						$is_initialized = isset( $option_values['is_initialized'] ) ? true : false;
						if ( ! $is_initialized ) {
							$selected_buttons = array(
								'furigana',
								'break-with-clauses',
								'simplified-japanese',
								'ruby',
							);
						} else {
							$selected_buttons = isset( $option_values['buttons'] ) ? $option_values['buttons'] : array();
						}
						echo '<input type="checkbox" id="buttons_simplified" class="" name="simplified_japanese_settings[buttons][]" ' . ( in_array( 'simplified-japanese', $selected_buttons, true ) ? 'checked' : '' ) . ' value="simplified-japanese" /><label for="buttons_simplified">' . esc_html__( 'Make Simplified Japanese', 'simplified-japanese' ) . '</label>' .
							'<br>' .
							'<input type="checkbox" id="buttons_break" class="" name="simplified_japanese_settings[buttons][]" ' . ( in_array( 'break-with-clauses', $selected_buttons, true ) ? 'checked' : '' ) . ' value="break-with-clauses" /><label for="buttons_break">' . esc_html__( 'Break with Clauses', 'simplified-japanese' ) . '</label>' .
							'<br>' .
							'<input type="checkbox" id="buttons_furigana" class="" name="simplified_japanese_settings[buttons][]" ' . ( in_array( 'furigana', $selected_buttons, true ) ? 'checked' : '' ) . ' value="furigana" /><label for="buttons_furigana">' . esc_html__( 'Put on Furigana', 'simplified-japanese' ) . '</label>' .
							'<br>' .
							'<input type="checkbox" id="buttons_ruby" class="" name="simplified_japanese_settings[buttons][]" ' . ( in_array( 'ruby', $selected_buttons, true ) ? 'checked' : '' ) . ' value="ruby" /><label for="buttons_ruby">' . esc_html__( 'Edit Ruby', 'simplified-japanese' ) . '</label>';
					},
					'plugin_settings_page',
					'simplified_japanese_setting_editor'
				);
				add_settings_field(
					'separator',
					__( 'Separation separator', 'simplified-japanese' ),
					function () {
						$setting = wp_parse_args( get_option( 'simplified_japanese_settings' ), array( 'separator' => '&#12288;' ) );
						// phpcs:disable
						echo '<input type="text" id="separator" class="medium-text" name="simplified_japanese_settings[separator]" value="' . htmlspecialchars( esc_attr( $setting['separator'] ), ENT_HTML5, 'UTF-8' ) . '" />';
						// phpcs:enable
					},
					'plugin_settings_page',
					'simplified_japanese_setting_editor',
					array(
						'label_for' => 'separator',
					)
				);
				add_settings_field(
					'split_in_editor',
					__( 'Behavior when adding furigana', 'simplified-japanese' ),
					function () {
						$option_value = self::set_default_value( 'split_in_editor', 0 );
						echo '<input type="checkbox" id="split_in_editor" class="" name="simplified_japanese_settings[split_in_editor]" ' . checked( $option_value, 1, false ) . ' value="1" />' .
							'<label for="split_in_editor">' . esc_html__( 'Break with clauses when adding furigana in richtext', 'simplified-japanese' ) . '</label>' .
							'<p class="description">' . esc_html__( 'Press the shift key and click the button for the opposite setting.', 'simplified-japanese' ) . '</p>';
					},
					'plugin_settings_page',
					'simplified_japanese_setting_editor'
				);
				add_settings_field(
					'split_in_editor_s',
					__( 'Behavior when translating to simplified japanese (1)', 'simplified-japanese' ),
					function () {
						$option_value = self::set_default_value( 'split_in_editor_s', 0 );
						echo '<input type="checkbox" id="split_in_editor_s" class="" name="simplified_japanese_settings[split_in_editor_s]" ' . checked( $option_value, 1, false ) . ' value="1" />' .
							'<label for="split_in_editor_s">' . esc_html__( 'Break with clauses when translating to Simplified Japanese in richtext', 'simplified-japanese' ) . '</label>' .
							'<p class="description">' . esc_html__( 'Press the shift key and click the button for the opposite setting.', 'simplified-japanese' ) . '</p>';
					},
					'plugin_settings_page',
					'simplified_japanese_setting_editor'
				);
				add_settings_field(
					'ruby_in_editor_s',
					__( 'Behavior when translating to simplified japanese (2)', 'simplified-japanese' ),
					function () {
						$option_value = self::set_default_value( 'ruby_in_editor_s', 0 );
						echo '<input type="checkbox" id="ruby_in_editor_s" class="" name="simplified_japanese_settings[ruby_in_editor_s]" ' . checked( $option_value, 1, false ) . ' value="1" />' .
							'<label for="ruby_in_editor_s">' . esc_html__( 'Add ruby when translating to Simplified Japanese in richtext', 'simplified-japanese' ) . '</label>' .
							'<p class="description">' . esc_html__( 'Press the option key and click the button for the opposite setting.', 'simplified-japanese' ) . '</p>';
					},
					'plugin_settings_page',
					'simplified_japanese_setting_editor'
				);

				// ルビ設定
				add_settings_section(
					'simplified_japanese_setting_ruby',
					__( 'Ruby Settings', 'simplified-japanese' ),
					null,
					'plugin_settings_page'
				);
				add_settings_field(
					'add_rp',
					__( 'Use &lt;rp&gt; tag', 'simplified-japanese' ),
					function () {
						$option_value = self::set_default_value( 'add_rp', 0 );
						echo '<input type="checkbox" id="add_rp" class="" name="simplified_japanese_settings[add_rp]" ' . checked( $option_value, 1, false ) . ' value="1" />' .
							'<label for="add_rp">' . esc_html__( 'Add Ruby Parentheses(&lt;rp&gt;~&lt;/rp&gt;) for unsupported browsers', 'simplified-japanese' ) . '</label>';
					},
					'plugin_settings_page',
					'simplified_japanese_setting_ruby'
				);

				// 伝えるウェブAPI設定
				add_settings_section(
					'simplified_japanese_setting_api_key',
					__( 'Tsutaeru Web API', 'simplified-japanese' ),
					function () {
						echo '<p><button type="button" id="request_tsutaeru_api_key" class="button action">' . esc_html__( 'Request a Tsutaeru Web API Key', 'simplified-japanese' ) . '</button></p>' .
							'<p id="success_request_api_key" hidden>' . esc_html__( 'You have successfully applied for an API key. Save your settings.', 'simplified-japanese' ) . '</p>';
					},
					'plugin_settings_page'
				);
				add_settings_field(
					'tsutaeru_email',
					__( 'E-mail', 'simplified-japanese' ),
					function () {
						$setting = wp_parse_args( get_option( 'simplified_japanese_settings' ), array( 'tsutaeru_email' => '' ) );
						echo '<input type="text" id="tsutaeru_email" class="regular-text" name="simplified_japanese_settings[tsutaeru_email]" value="' . esc_attr( $setting['tsutaeru_email'] ) . '" />' .
							'<p class="description">' . esc_html__( 'Please enter the email address to use when applying for the API key.', 'simplified-japanese' ) . '</p>';
					},
					'plugin_settings_page',
					'simplified_japanese_setting_api_key',
					array(
						'label_for' => 'tsutaeru_email',
					)
				);
				add_settings_field(
					'tsutaeru_client_id',
					__( 'Client ID', 'simplified-japanese' ),
					function () {
						$setting = wp_parse_args( get_option( 'simplified_japanese_settings' ), array( 'tsutaeru_client_id' => '' ) );
						echo '<input type="text" id="tsutaeru_client_id" class="regular-text" name="simplified_japanese_settings[tsutaeru_client_id]" value="' . esc_attr( $setting['tsutaeru_client_id'] ) . '" />';
					},
					'plugin_settings_page',
					'simplified_japanese_setting_api_key',
					array(
						'label_for' => 'tsutaeru_client_id',
					)
				);
				add_settings_field(
					'tsutaeru_client_secret',
					__( 'Client Secret', 'simplified-japanese' ),
					function () {
						$setting = wp_parse_args( get_option( 'simplified_japanese_settings' ), array( 'tsutaeru_client_secret' => '' ) );
						echo '<input type="text" id="tsutaeru_client_secret" class="regular-text" name="simplified_japanese_settings[tsutaeru_client_secret]" value="' . esc_attr( $setting['tsutaeru_client_secret'] ) . '" />';
					},
					'plugin_settings_page',
					'simplified_japanese_setting_api_key',
					array(
						'label_for' => 'tsutaeru_client_secret',
					)
				);
				add_settings_field(
					'caching',
					__( 'Cache Setting', 'simplified-japanese' ),
					function () {
						// phpcs:disable
						if ( isset( $_GET['settings-updated'] ) && 'true' === $_GET['settings-updated'] ) {
							$tsutaeru_web = new Tsutaeru_Web();
							$tsutaeru_web->clear_cache();
						}
						// phpcs:enable
						$option_value = self::set_default_value( 'caching', 1 );
						echo '<input type="checkbox" id="caching" class="" name="simplified_japanese_settings[caching]" ' . checked( $option_value, 1, false ) . ' value="1" />' .
							'<label for="caching">' . esc_html__( 'Cache results', 'simplified-japanese' ) . '</label>' .
							'<p class="description">' . esc_html__( 'If you save the settings, clear the cache.', 'simplified-japanese' ) . '</p>';
					},
					'plugin_settings_page',
					'simplified_japanese_setting_api_key'
				);

				// 開発環境向け
				add_settings_section(
					'simplified_japanese_setting_for_testing',
					__( 'For Testing', 'simplified-japanese' ),
					null,
					'plugin_settings_page'
				);
				add_settings_field(
					'ssl_verify_off',
					__( 'SSL Verify', 'simplified-japanese' ),
					function () {
						$option_value = self::set_default_value( 'ssl_verify_off', 1 );
						echo '<input type="checkbox" id="ssl_verify_off" class="" name="simplified_japanese_settings[ssl_verify_off]" ' . checked( $option_value, 1, false ) . ' value="1" />' .
							'<label for="ssl_verify_off">' . esc_html__( 'Disables verification of the SSL certificate', 'simplified-japanese' ) . '</label>' .
							'<p class="description">' . esc_html__( 'Used when encrypted connection fails in development environment etc.', 'simplified-japanese' ) . '</p>';
					},
					'plugin_settings_page',
					'simplified_japanese_setting_for_testing'
				);
				// 初期化済みか否かの判定（適当なところに置いておく）
				add_settings_field(
					'is_initialized',
					null,
					function () {
						echo '<input type="hidden" id="is_initialized" class="" name="simplified_japanese_settings[is_initialized]" value="1" />';
					},
					'plugin_settings_page',
					'simplified_japanese_setting_for_testing'
				);
			}
		);

		add_options_page(
			__( 'Settings for simplified japanese plugin', 'simplified-japanese' ),
			__( 'Simplified japanese', 'simplified-japanese' ),
			'manage_options',
			'simplified_japanese',
			array( __CLASS__, 'plugin_settings_page_html' )
		);
	}

	public static function add_plugin_setting_page_script( $hook_suffix ) {
		if ( 'settings_page_simplified_japanese' === $hook_suffix ) {
			wp_enqueue_script(
				'simplified-japanese-setting',
				plugins_url( 'assets/js/setting/request-api-key.js', __FILE__ ),
				null,
				'1.0.0',
				false
			);
		}
	}
}

add_action( 'plugins_loaded', array( 'Simplified_Japanese\Simplified_Japanese', 'on_plugins_loaded' ) );
add_action( 'admin_init', array( 'Simplified_Japanese\Simplified_Japanese', 'init' ) );
