/*

Script: xml/xmlWrapper.js

License: MIT license.

Copyright: Thomas McGrew, (c)2009, http://ecolihub.org

*/

/*

Class: XMLWrapper
		Creates a new Document Wrapper object. If no options are specified, the document will contain only a processing instruction.  If a root tag is specified, the document will contain that single root tag. If the root tag has a namespace prefix, the namespace argument must specify the URL that identifies the namespace.

*/
var XMLWrapper = new Class({
		$family: { name: 'xmlwrapper' },
		options: {
				xml: null,
				namespace: null,
				addProcessingInstruction:true,
				xmlVersion:'1.0',
				charset:'UTF-8'
		},
		// IE is choking on the mootools implementation of this...
		setOptions: function( options ) { for( var i in  options ) this.options[i] = options[i] },
//		Implements: Options,
		initialize: function( options  )
		{
				this.setOptions( options );
				if ( $type( this.options.xml ) == "string" ) 
					this.options.xml = this.parseXML( this.options.xml );
				if ( $type( this.options.xml ) == "element" ) 
				{
					var rootNode = this.options.xml
					this.options.xml = ( document.implementation && document.implementation.createDocument ) 
						? document.implementation.createDocument( null, null, null ) 
						: new ActiveXObject( "MSXML2.DOMDocument" );
					this.options.xml.appendChild( rootNode.cloneNode( true ));
				}
				if ( !this.options.xml )
				{
					this.options.xml = ( document.implementation && document.implementation.createDocument ) 
						? document.implementation.createDocument( null, null, null ) 
						: new ActiveXObject( "MSXML2.DOMDocument" );
				}
				if ( this.options.xml /* && this.options.xml.nodeName == "#document" */ )
				{
					this.doc = this.options.xml;
				}
				this.options.namespace = ( this.doc.lastChild && this.doc.lastChild.attributes.xmlns ) ? this.doc.lastChild.attributes.xmlns.nodeValue : null;
				if ( this.options.addProcessingInstruction && ( this.toString( ).substring( 0, 5 ) != '<?xml' ))
						this.doc.insertBefore( this.doc.createProcessingInstruction( 'xml', 'version="'+this.options.xmlVersion+'" encoding="'+this.options.charset+'"' ), this.doc.firstChild );
				this.documentElement = this.lastChild = this.doc.lastChild;
		},

		parseXML: function( text )
		{
				try //Firefox, Mozilla, Opera, etc.
				{
						parser = new DOMParser();
						xmlDoc = parser.parseFromString(text,"text/xml");
				}
				catch(e)
				{
						try //Internet Explorer
						{
//								xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
								xmlDoc=new ActiveXObject("MSXML2.DOMDocument");
								xmlDoc.async="false";
								xmlDoc.loadXML(text);
						}
						catch(e)
						{
								alert( "Your browser was unable to parse the xml: "+text );
								return;
						}
				}
				return xmlDoc;
		},

		toString: function( selector, context ){
				if ( !selector ) return new XMLSerializer( ).serializeToString( this.doc );
				else return this.toStrings( selector, context ).join('');
		},

		toStrings: function( selector, context ){
				var returnValue = [ ];
				this.getElements( selector, context ).each( function( node ){
						returnValue.push(  new XMLSerializer( ).serializeToString( node ));
				});
				return returnValue;
		},

		insert: function( selector, newTag, nextSibling, context )
		{
				if ( $type( nextSibling ) == 'string' )
						nextSibling = ( nextSibling[0] == '/' ) ?
								this.getElement( [ selector, nextSibling ].join( '' ), context):
								this.getElement( [ selector, nextSibling ].join( '/' ), context );
				if ( $type( newTag ) == 'string' )
				{
						if ( this.doc.createElementNS )
								newTag = this.doc.createElementNS( this.options.namespace, newTag );
						else
								newTag = this.doc.createElement( newTag );
				}
				else
				{
						//clone the node
						var clonedTag = newTag.cloneNode( true );
						if ( newTag.parentNode )
								newTag.parentNode.removeChild( newTag );
						newTag = clonedTag;
				}

				if ( $type( selector ) == 'string' )
						selector = this.getElement( selector );
				return selector.insertBefore( newTag, nextSibling );
		},

		getElement: function( selector, context )
		{
				if ( $type( selector ) != 'string' ) return selector;
						var elements = this.getElements( selector, context );
				if ( elements.length )
						return elements.item( 0 );
				return null;
		},

		getElements: function( selector, context )
		{
				if ( $type( selector ) != 'string' ) return selector;
				// Todo: implement xpath context
				//if ( $type( context ) == 'string' ) context = this.getElement( context );
				//context = ( context ) ? context : this.doc;
				return new XPathResult({ rootNode: this.doc, query: selector })
		},

		getValue: function( selector, context )
		{
				var node = this.getElement( selector, context );
				return ( node && node.firstChild ) ? node.firstChild.nodeValue : null;
		},
		setValue: function( selector, text, context )
		{
				selector = this.getElement( selector, context );
				while( selector.firstChild ) selector.removeChild( selector.firstChild )
				if ( text )
						selector.appendChild( this.doc.createTextNode( text ));
				return selector;
		},

		getValues: function( selector, context )
		{
				var returnValue = [ ];
				this.getElements( selector, context ).each( function( node ){
								returnValue.push( ( node.firstChild ) ? node.firstChild.nodeValue : null )
				});
				return returnValue;
		},
		setValues: function( selector, textArray, context )
		{
				selector = this.getElements( selector, context );
				for( var i=0; i < Math.min( textArray.length, selector.length ); i++ )
				{
						while( selector[i].firstChild ) selector[i].removeChild( selector[i].firstChild )
						selector[i].appendChild( this.doc.createTextNode( textArray[ i ] ));
				}
				return selector;
		},
		getTagName: function( selector, context )
		{
				return getElement( selector, context ).tagName;
		},
		getTagNames: function( selector, context )
		{
				var tags = this.getElements( selector, context );
				var returnvalue = [ ];
				for( var i=0; i < tags.length; i++ )
						returnvalue.push( tags[ i ].tagName );
				return returnvalue;
		},

		removeElement: function( selector, context )
		{
				selector = this.getElement( selector, context )
				selector.parentNode.removeChild( selector );
				return selector;
		},
		removeElements: function( selector, context )
		{
				selector = this.getElements( selector, context );
				for( var i=0; i < selector.length; i++ )
						selector[i].parentNode.removeChild( selector[i] )
				return selector;
		},

		// temporary compatibility functions - these should not be documented (or used)
		getElementsByTagName: function( tag )
		{
				return this.doc.getElementsByTagName( tag );
		},
		createElement: function( tag )
		{
				return this.doc.createElement( this.options.namespace, tag );
		},
		createTextNode: function( text )
		{
				return this.doc.createTextNode( text );
		}
});

var XPathResult = new Class({
		$family: { name: 'xpath' },
		options: {
				rootNode: document,
				query: false
		},
		// IE is choking on the mootools implementation of this
		setOptions: function( options ) { for( var i in  options ) this.options[i] = options[i] },
		initialize: function( options )
		{
				this.setOptions( options );
//			  for( var i in  options ) this.options[i] = options[i]
				this.length = 0;
				this.refresh( );
		},
		item: function( index )
		{
				return this.items[ index ];
		},
		each: function( func )
		{
				this.items.each( func );
		},
		refresh: function( )
		{
				this.items = [ ];
				multiselect = this.options.query.split( '|' );
				for ( h=0; h < multiselect.length; h++ )
				{
						var selectors = multiselect[ h ].trim( ).replace( /\/\//g , '/;' ).split( '/' );
						var selected, index, tmp, tmpArray=[ ];
						var items = [ this.options.rootNode ];
						if ( selectors[0] == "" )
						{
								selectors = selectors.slice( 1 );
						}
						else if ( selectors.length == 0 )
						{
								items.empty( );
								tmp = this.options.rootNode.getElementsByTagName( selectors[ 0 ] )
								for( var i=0; i < tmp.length; i++ )
								{
										items.extend( tmp[ i ].childNodes );
								}

								selectors = selectors.slice( 1 );

						}
						var last = function( ){ return tmpArray.length };
						for( var i=0; i < selectors.length; i++ )
						{
								selected = $A(items);
								items.empty( ); tmpArray.empty( )
								index = false;
								if ( tmp = selectors[ i ].match( /\[([a-zA-Z0-9\(\)\-\+\*\s]+)\]$/ ) )
								{
										index = tmp[ 1 ].replace( ' div ', ' / ' );
										selectors[ i ] = selectors[ i ].replace( tmp[ 0 ], '' );
								}
								if ( selectors[ i ].charAt( 0 ) == ';' )
								{
										var s = selectors[ i ].substring( 1 );
										for( var j=0; j < selected.length; j++ )
										{
												tmp =  selected[ j ].getElementsByTagName( s )
												for( var k=0; k < tmp.length; k++ ) tmpArray.push( tmp[ k ] );
										}
								}
								else
								{
										for( var j=0; j < selected.length; j++ )
										{
												tmp = selected[ j ].childNodes
												for ( var k=0; k < tmp.length; k++ )
														if ( tmp[ k ].tagName == selectors[ i ] || ( tmp[ k ].tagName && selectors[ i ] == '*' )) tmpArray.push( tmp[ k ] );
										}
								}
								if ( index ) tmpArray = [ tmpArray[ eval( index ) -1 ] ];
								items.extend( tmpArray );
						}
						this.items.extend( items );
				}
				for( var i=0; this[i] || this.items[i]; i++ )
						this[i] = this.items[i];
				this.length = this.items.length
		},
		join: function( delimiter )
		{
			return this.items.join( delimiter );
		}
});



if ( Browser.Engine.trident ) // IE
{
		XMLSerializer = new Class({
			serializeToString: function( xmlDoc )
			{
				return xmlDoc.xml
			}
	   });
}


