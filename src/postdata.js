export default function postData( url, data ) {
	return fetch( url, {
		method: 'POST',
		mode: 'same-origin',
		cache: 'no-cache',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: Object.keys( data )
			.map( ( key ) => key + '=' + encodeURIComponent( data[ key ] ) )
			.join( '&' ),
	} ).then( ( response ) => response.json() );
}
