<?php
namespace Simplified_Japanese;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Invalid request.' );
}

if ( ! defined( 'DS' ) ) {
	define( 'DS', DIRECTORY_SEPARATOR );
}

class Tsutaeru_Web {
	private $simplified_japanese_settings  = null;
	private $client_id                     = null;
	private $client_secret                 = null;
	private $access_token                  = null;
	private $ssl_verify_off                = null;
	private $caching                       = true;
	private $cache_dir                     = WP_CONTENT_DIR . DS . 'cache' . DS . 'simplified-japanese';
	private $separator                     = null;
	private $add_rp_tag                    = null;
	private $errors                        = array();
	private $retry                         = false;
	private $parsed                        = array();
	private $remote_ip                     = null;
	private $tsutaeru_token_end_point      = 'https://tsutaeru.cloud/api/token/wordpress.php';
	private $tsutaeru_simplified_end_point = 'https://tsutaeru.cloud/api/simplified/wordpress.php';
	private $tsutaeru_request_secret_key   = 'https://tsutaeru.cloud/api/token/register_wordpress.php';

	public function __construct() {
		$settings = get_option( 'simplified_japanese_settings' );
		$this->simplified_japanese_settings = $settings;
		$this->client_id = isset( $settings['tsutaeru_client_id'] ) ? $settings['tsutaeru_client_id'] : null;
		$this->client_secret = isset( $settings['tsutaeru_client_secret'] ) ? $settings['tsutaeru_client_secret'] : null;
		$this->get_remote_ip();
		$this->ssl_verify_off = isset( $settings['ssl_verify_off'] ) ? $settings['ssl_verify_off'] : false;
	}

	private function get_remote_ip() {
		if ( isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) && $_SERVER['HTTP_X_FORWARDED_FOR'] ) {
			$remote_ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
			if ( strpos( $remote_ip, ',' ) !== false ) {
				$remote_addrs = preg_split( '/\s*,\s*/', $remote_ip );
				foreach ( $remote_addrs as $remote_addr ) {
					if ( filter_var( $remote_addr, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) ) {
						$remote_ip = $remote_addr;
						break;
					}
				}
			}
			$this->remote_ip = $remote_ip;
		} elseif ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
			$this->remote_ip = $_SERVER['REMOTE_ADDR'];
		} else {
			$this->remote_ip = 'localhost';
		}
	}

	private function make_cache_path( $path, $mode = 0777 ) {
		if ( is_dir( $path ) ) {
			return true;
		}
		return mkdir( $path, $mode, true );
	}

	private function remove_dir( $dir ) {
		$dir = rtrim( $dir, DS );
		if ( ! is_dir( $dir ) ) {
			return;
		}
		// phpcs:disable
		if ( $handle = opendir( $dir ) ) {
			while ( false !== ( $item = readdir( $handle ) ) ) {
				if ( '.' !== $item && '..' !== $item ) {
					if ( is_dir( $dir . DS . $item ) ) {
						self::remove_dir( $dir . DS . $item, false );
					} else {
						$file = $dir . DS . $item;
						@unlink( $file );
					}
				}
			}
			closedir( $handle );
			return @rmdir( $dir );
		}
		// phpcs:enable
	}

	public function clear_cache() {
		$this->remove_dir( $this->cache_dir );
	}

	private function save_cache( $path, $data, $size = false ) {
		if ( is_dir( $path ) ) {
			return false;
		}
		if ( ! is_dir( dirname( $path ) ) ) {
			$this->make_cache_path( dirname( $path ) );
		}
		// phpcs:disable
		$size = file_put_contents( "{$path}.new", $data );
		if ( false !== $size ) {
			try {
				if ( ! @rename( "{$path}.new", $path ) ) {
					if ( @unlink( "{$path}.new" ) ) {
						$size = false;
					}
				}
			} catch ( Exception $e ) {
				trigger_error( "Cannot write file '{$path}'!" );
			}
		}
		if ( false === $size ) {
			trigger_error( "Cannot write file '{$path}'!" );
		}
		// phpcs:enable
		return $size;
	}

	private function get_cache( $path ) {
		// phpcs:disable
		return file_get_contents( $path );
		// phpcs:enable
	}

	private function exists_cache( $path ) {
		return file_exists( $path );
	}

	public function request_secret_key( $api_key, $site_name, $email ) {
		$end_point = $this->tsutaeru_request_secret_key;
		$options = array(
			'body' => array(
				'api_key' => $api_key,
				'name'    => $site_name,
				'email'   => $email,
			),
		);
		if ( $this->ssl_verify_off ) {
			$options['sslverify'] = false;
		}
		$result = wp_remote_post( $end_point, $options );
		return json_decode( $result['body'] );
	}

	private function get_token( $force = false ) {
		if ( ! $force ) {
			$access_token = $this->access_token;
			if ( ! $access_token ) {
				if ( isset( $this->simplified_japanese_settings['tsutaeru_access_token'] ) ) {
					$access_token = $this->simplified_japanese_settings['tsutaeru_access_token'];
				}
			}
			if ( $access_token ) {
				$this->access_token = $access_token;
				return 200;
			}
		}
		if ( ! $this->client_id || ! $this->client_secret ) {
			$message = __( 'Client ID and Client Secret are required.', 'simplified-japanese' );
			$this->errors[ $message ] = true;
			return 401;
		}
		$end_point = $this->tsutaeru_token_end_point;
		$data = array(
			'client_id'     => $this->client_id,
			'client_secret' => $this->client_secret,
		);
		$options = array(
			'headers'   => array(
				'content-type' => 'application/x-www-form-urlencoded',
			),
			'body'      => wp_json_encode( $data ),
			'sslverify' => $this->ssl_verify_off ? false : true,
		);
		$result = wp_remote_post( $end_point, $options );
		$json = json_decode( $result['body'], true );
		$status = (int) $json['status'];
		if ( 200 !== $status ) {
			$message = __( 'Authentication failed.', 'simplified-japanese' );
			$this->errors[ $message ] = true;
			return $status;
		}
		$access_token = $json['access_token'];
		$this->access_token = $access_token;
		$this->simplified_japanese_settings['tsutaeru_access_token'] = $access_token;
		update_option( 'simplified_japanese_settings', $this->simplified_japanese_settings );
		return $status;
	}

	private function get_json_from_tsutaeru_web( $content, $cache_key ) {
		$caching = isset( $this->simplified_japanese_settings['caching'] ) ?
			$this->simplified_japanese_settings['caching'] : false;
		$this->caching = $caching;
		$result = null;
		if ( $caching ) {
			$cache_dir = $this->cache_dir;
			$cache_path = $cache_dir . DS . md5( $content ) . "-${cache_key}.json";
			if ( $this->exists_cache( $cache_path ) ) {
				$result = $this->get_cache( $cache_path );
			}
		}
		if ( $result ) {
			$json = json_decode( $result, true );
		} else {
			if ( ! $this->access_token ) {
				$get_token_status = $this->get_token( $this->retry );
				if ( 200 !== $get_token_status ) {
					return array( 'status' => $get_token_status );
				}
			}
			$access_token = $this->access_token;
			$end_point = $this->tsutaeru_simplified_end_point;
			$data = array(
				'phrase' => $content,
			);
			$forward_ip = $this->remote_ip;
			$options = array(
				'headers'   => array(
					'access_token' => $access_token,
					'forward_ip'   => $forward_ip,
					'content-type' => 'application/x-www-form-urlencoded',
				),
				'body'      => wp_json_encode( $data ),
				'sslverify' => $this->ssl_verify_off ? false : true,
			);
			$result = wp_remote_post( $end_point, $options );
			$json = json_decode( $result['body'], true );
			$status = (int) $json['status'];
			if ( ! $this->retry && ( 400 === $status || 401 === $status ) ) {
				$this->access_token = null;
				$this->simplified_japanese_settings['tsutaeru_access_token'] = null;
				update_option( 'simplified_japanese_settings', $this->simplified_japanese_settings );
				$this->retry = true;
				return $this->get_json_from_tsutaeru_web( $content, $cache_key );
			}

			if ( 200 === $status && $caching ) {
				$this->save_cache( $cache_path, $result['body'] );
			}
		}
		$json = is_array( $json ) ? $json : json_decode( $result, true );
		return $json;
	}

	public function get_phonetic( $text ) {
		$text = wp_strip_all_tags( $text );
		$json = $this->get_json_from_tsutaeru_web( $text, 'phonetic' );
		$status = (int) $json['status'];
		if ( 500 === $status ) {
			$error_messages = array( __( 'Add furigana failed because text is too large.', 'simplified-japanese' ) );
			return array( null, $status, $error_messages );
		} elseif ( ! $this->retry && ( 400 === $status || 401 === $status ) ) {
			$this->access_token = null;
			$this->simplified_japanese_settings['tsutaeru_access_token'] = null;
			update_option( 'simplified_japanese_settings', $this->simplified_japanese_settings );
			$this->retry = true;
			return $this->get_phonetic( $text );
		} elseif ( $this->retry && ( 400 === $status || 401 === $status ) ) {
			if ( count( $this->errors ) ) {
				$error_messages = array();
				foreach ( $this->errors as $key => $value ) {
					$error_messages[] = $key;
				}
			}

			return array( null, $status, $error_messages );
		}
		$result = $json['ruby'];

		$phonetic = '';
		// phpcs:disable
		$dom = new \DOMDocument;
		libxml_use_internal_errors( true );
		$html_intro = '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body>';
		$html_outro = '</body></html>';
		$dom->loadHTML( $html_intro . $result . $html_outro );
		$rt_nodes = $dom->getElementsByTagName( 'rt' );
		foreach ( $rt_nodes as $node ) {
			$phonetic .= $node->nodeValue;
		}
		// phpcs:enable
		$phonetic = mb_convert_kana( $phonetic, 'c', 'UTF-8' );
		return array( $phonetic, $status, null );
	}

	public function filter_furigana( $content, $arg, $simplified = false ) {
		$original = $content;
		$caching = isset( $this->simplified_japanese_settings['caching'] ) ?
			$this->simplified_japanese_settings['caching'] : false;
		$this->caching = $caching;
		$separator = isset( $this->simplified_japanese_settings['separator'] ) ?
			$this->simplified_japanese_settings['separator'] : '&nbsp;&nbsp;';
		$this->separator = $separator;
		$add_rp = isset( $this->simplified_japanese_settings['add_rp'] ) ? true : false;
		$this->add_rp_tag = $add_rp;
		if ( $caching ) {
			$cache_dir = $this->cache_dir;
			$arg = (int) $arg;
			$pfx = $simplified ? '-simplified' : '';
			$cache_path = $cache_dir . DS . md5( $content ) . "{$pfx}-{$arg}.html";
			if ( $this->exists_cache( $cache_path ) ) {
				$res = $this->get_cache( $cache_path );
				if ( $res ) {
					return array( $res, 200 );
				}
			}
		}
		$contents = preg_split( '/(<[^>]*?>)/s', $content, -1, PREG_SPLIT_NO_EMPTY | PREG_SPLIT_DELIM_CAPTURE );
		$content = '';
		$in_ruby = false;
		$status = null;
		foreach ( $contents as $data ) {
			if ( ! $data ) {
				continue;
			}
			if ( ! $in_ruby &&
				( strpos( $data, '<' ) === false && strpos( $data, '>' ) === false ) ) {
				if ( strlen( $data ) !== mb_strlen( $data ) ) {
					if ( $simplified ) {
						$json = $this->get_json_from_tsutaeru_web( $data, 'simplified' );
						$status = (int) $json['status'];
						if ( 500 === $status ) {
							$message = __( 'Simplified Japanese translation failed because text is too large.', 'simplified-japanese' );
							$this->errors[ $message ] = true;
							break;
						} elseif ( 400 === $status || 401 === $status ) {
							break;
						}
						$data = $json['result'];
					}
					list( $data, $status ) = $this->finalize( $data, $arg, $separator, $add_rp );
					if ( 200 !== $status ) {
						break;
					}
				}
			} else {
				if ( $simplified ) {
					$strip_data = wp_strip_all_tags( $data );
				}
				if ( stripos( $data, '<ruby' ) === 0 ) {
					$in_ruby = true;
				} elseif ( stripos( $data, '</ruby' ) === 0 ) {
					$in_ruby = false;
				}
			}
			$content .= $data;
		}
		if ( $caching && $cache_path && $content && count( $this->errors ) === 0 ) {
			$this->save_cache( $cache_path, $content );
		}

		$error_messages = array();
		if ( count( $this->errors ) ) {
			foreach ( $this->errors as $key => $value ) {
				$error_messages[] = $key;
			}
		}

		return array( $content, $status, $error_messages );
	}

	private function finalize( $content, $arg, $separator, $add_rp ) {
		if ( 6 === $arg ) {
			return array( $content, 200 );
		}

		// 分かち書き
		if ( 2 === $arg || 3 === $arg || 5 === $arg ) {
			$split_content = '';
			$json = $this->get_json_from_tsutaeru_web( $content, 'split' );
			$status = (int) $json['status'];
			if ( 500 === $status ) {
				$message = __( 'Break with clauses failed because text is too large.', 'simplified-japanese' );
				$this->errors[ $message ] = true;
				return array( null, $status );
			} elseif ( ! $this->retry && ( 400 === $status || 401 === $status ) ) {
				$this->access_token = null;
				$this->simplified_japanese_settings['tsutaeru_access_token'] = null;
				update_option( 'simplified_japanese_settings', $this->simplified_japanese_settings );
				$this->retry = true;
				return $this->finalize( $content, $arg, $separator, $add_rp );
			} elseif ( $this->retry && ( 400 === $status || 401 === $status ) ) {
				return array( null, $status );
			}
			$result = $json['split'];
			$split_content .= $result;
			$split_content = preg_replace( '/&nbsp;&nbsp;/', $separator, $split_content );

			if ( 3 === $arg ) {
				return array( $split_content, 200 );
			}
			$content = $split_content;
		}
		if ( -1 === $arg ) {
			return array( $content, 200 );
		}

		// ルビ付与
		$content_with_ruby = '';
		$json = $this->get_json_from_tsutaeru_web( $content, 'ruby' );
		$status = (int) $json['status'];
		if ( 500 === $status ) {
			$message = __( 'Add furigana failed because text is too large.', 'simplified-japanese' );
			$this->errors[ $message ] = true;
			return array( null, $status );
		} elseif ( ! $this->retry && ( 400 === $status || 401 === $status ) ) {
			$this->access_token = null;
			$this->simplified_japanese_settings['tsutaeru_access_token'] = null;
			update_option( 'simplified_japanese_settings', $this->simplified_japanese_settings );
			$this->retry = true;
			return $this->finalize( $content, $arg, $separator, $add_rp );
		} elseif ( $this->retry && ( 400 === $status || 401 === $status ) ) {
			return array( null, $status );
		}
		$result = $json['ruby'];
		$content_with_ruby .= $result;
		if ( ! $add_rp ) {
			$content_with_ruby = preg_replace( '/<rp>[^<]+<\/?rp>/', '', $content_with_ruby );
		}

		return array( $content_with_ruby, 200 );
	}
}
