'use strict';

const path = require('path');

module.exports = function ( context ) {
	const hooks = context.hooks
	const React = context.React
	const remote = context.electron.remote

	// Development Helpers
	remote.getCurrentWindow().openDevTools()
	window.reload = remote.getCurrentWebContents().reloadIgnoringCache

	// Require component
	const PixManager = require('./PixManager')(context)
	// Get router handle
	const Router = context.ReactRouter
	// Add Route
	hooks.addContent( 'routesSiteInfo', () => {
		return <Router.Route key="site-info-pixmanager" path="/site-info/:siteID/pixmanager" component={PixManager}/>
	} );

	hooks.addFilter( 'siteInfoMoreMenu', function ( menu, site ) {
		
		menu.push( {
			label: 'PixManager',
			enabled: !this.context.router.isActive(`/site-info/${site.id}/pixmanager` ),
			click: () => {
				context.events.send( 'goToRoute', `/site-info/${site.id}/pixmanager` );
			}
		} );

		return menu;

	} );

};