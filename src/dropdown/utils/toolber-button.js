/**
 * WordPress dependencies
 */
import { ToolbarButton } from '@wordpress/components';

const getToolbarButtonProps = ( { args, title, icon, edit } ) => {
	return {
		icon: icon || 'admin-customizer',
		title,
		onClick: () => {
			edit( args );
		},
		isActive: args.isActive,
	};
};

export const createToolbarButton = ( {
	args,
	name,
	formatName,
	title,
	icon,
	edit,
} ) => (
	<ToolbarButton
		{ ...getToolbarButtonProps( {
			args,
			name,
			formatName,
			title,
			icon,
			edit,
		} ) }
	/>
);
