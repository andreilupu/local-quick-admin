const childProcess = require ('child_process' )
// import Plugins from 'Plugins'

module.exports = function ( context ) {

	const Component = context.React.Component
	const React = context.React
	const $ = context.jQuery

	return class SitePixManager extends Component {
		constructor( props ) {
			super( props )


			
			this.state = {
				content: null,
				active_plugins: null,
				inactive_plugins: null
			}
		}

		componentDidMount() {
			// set up 
			if ( 'running' === this.props.siteStatus ) {
				console.log( this );
				// this.getPluginList();
			} else {
				this.setState( { content: <p>Machine not running!</p> } )
			}
		}

		componentWillUnmount() {
			// tear down
		}

		getPluginList() {
			this.setState( { content: <p>loading...</p> } )
				
			// get site object using siteID
			let site = this.props.sites[ this.props.params.siteID ]

			let path = '"' + context.environment.dockerPath  +'"'
			// console.log();

			// construct command using bundled docker binary to execute 'wp plugin list' inside container
			let wp_cli_get_active_plugins = `${path} exec ${site.container} wp plugin list --path=/app/public --field=name --status=active --allow-root`
			let wp_cli_get_inactive_plugins = `${path} exec ${site.container} wp plugin list --path=/app/public --field=name --status=inactive --allow-root`

			// execute command in docker env and run callback when it returns
			childProcess.exec( wp_cli_get_active_plugins, { env: context.environment.dockerEnv }, (error, stdout, stderr) => {
				// Display error message if there's an issue
				if (error) {
					this.setState( { content:  <p>Error retrieving active plugin list: <pre>{stderr}</pre></p> } )
				} else {
					// split list into array
					let plugins = stdout.trim().split( "\n" )
					// Only create unordered list if there are plugins to list
					if ( plugins.length && plugins[0].length > 1 ) {
						{/*this.setState( { content: <ul>{ plugins.map( (item) => <li key={ plugins.indexOf(item) }>{ item }</li> ) }</ul> } );*/}

						this.setState( { active_plugins: plugins} );
					} else {
						this.setState( { content: <p>No active plugins.</p> } )
					}
				}
			} );

			// execute command in docker env and run callback when it returns
			childProcess.exec( wp_cli_get_inactive_plugins, { env: context.environment.dockerEnv }, (error, stdout, stderr) => {
				// Display error message if there's an issue
				if (error) {
					this.setState( { content:  <p>Error retrieving inactive plugin list: <pre>{stderr}</pre></p> } )
				} else {
					let plugins = stdout.trim().split( "\n" )
					// split list into array

					// Only create unordered list if there are plugins to list
					if ( plugins.length && plugins[0].length > 1 ) {
						// this.setState( { content: <ul>{ plugins.map( (item) => <li key={ plugins.indexOf(item) }>{ item }</li> ) }</ul> } );
						this.setState( { content: stdout.trim() } );
						this.setState( { inactive_plugins: plugins} );
					} else {
						this.setState( { content: <p>No inactive plugins.</p> } )
					}
				}
			} );
		}

		render() {

			const halfStyle = {
				flexBasis: '45%'
			}

			return (<div>

			{ this.props.site.multiSite === 'no' ?

				<div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', padding: '3%'}}>

					<h2 style={{ padding: '0 20px', flexBasis: '100%'}}>Pix Manager</h2>

					<hr style={{ padding: '0 20px', flexBasis: '100%'}} />

					<div style={halfStyle}>
						<h3>Active Plugins</h3>
						<div>
							{ this.state.active_plugins !== null ?
								<ul>{ this.state.active_plugins.map( (item) => <li key={ this.state.active_plugins.indexOf(item) }>{ item }</li> ) }</ul>
								:
								<p>None</p>
							}
						</div>
					</div>

					<div style={halfStyle}>
						<h3>Inactive Plugins</h3>
						<div>
							{ this.state.inactive_plugins !== null ?
								<ul>{ this.state.inactive_plugins.map( (item) => <li key={ this.state.inactive_plugins.indexOf(item) }>{ item }</li> ) }</ul>
								:
								<p>None</p>
							}
						</div>
					</div>

					<hr style={{ padding: '0 20px', flexBasis: '100%'}} />

					<div style={{ padding: '0 2px', flexBasis: '100%'}}>
						<h3>Debugging stuf</h3>
						{ this.state.content }
					</div>


					<hr style={{ padding: '0 20px', flexBasis: '100%'}} />
				</div>

				:
				<div>
					<h3>Multisite</h3>
					<span>You need to select a website</span>
					<ul>
						{ this.props.site.multiSiteDomains.map( (blog) => {
							console.log(blog);
							return <li key={ this.props.site.multiSiteDomains.indexOf(blog) }>{ blog }</li>
						} ) }
					</ul>
				</div>
			}

			</div>);
		}
	}

}