/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	TechnoteSpaceDropdown,
	TechnoteSpaceDropdownControls,
} from '../components';

export const getRichTextSetting = ( { name, create, setting = {} }, index ) => {
	const formatName = 'alfasado' + '/' + name;
	const title = setting.title;
	const icon = setting.icon;
	const edit = setting.edit;
	const component = ( args ) => (
		<TechnoteSpaceDropdownControls>
			{ create( { args, name, formatName, title, icon, edit } ) }
		</TechnoteSpaceDropdownControls>
	);

	setting.title = setting.title || name;
	setting.tagName = setting.tagName || 'span';
	setting.className = setting.className || name;
	setting.edit = ( args ) => {
		if ( ! index ) {
			return (
				<Fragment>
					{ component( args ) }
					<TechnoteSpaceDropdown />
				</Fragment>
			);
		}
		return component( args );
	};
	return [ formatName, setting ];
};
