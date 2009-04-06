/*

Script: xmlWrapper.js

Copyright: Thomas McGrew, (c)2009, http://ecolihub.org

License: MIT license.

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use,
	copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following
	conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.

*/

/*

Class: XMLWrapper
		Creates a new Document Wrapper object. If no options are specified, the document will contain only a processing instruction.  If a root tag is specified, the document will contain that single root tag. If the root tag has a namespace prefix, the namespace argument must specify the URL that identifies the namespace.

*/

var XMLWrapper = function( options  )
{
	this.setOptions( options );
	if ( typeof( this.options.xml ) == "string" ) 
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
	return this;
};

XMLWrapper.prototype.$family = { name: 'xmlwrapper' };

XMLWrapper.prototype.options = {
	xml: null,
	namespace: null,
	addProcessingInstruction:true,
	xmlVersion:'1.0',
	charset:'UTF-8'
};

XMLWrapper.prototype.setOptions = function( options ) { for( var i in  options ) this.options[i] = options[i] },

XMLWrapper.prototype.parseXML = function( text )
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
//			xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
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
};

XMLWrapper.prototype.toString = function( selector, context ){
	if ( !selector ) return new XMLSerializer( ).serializeToString( this.doc );
	else return this.toStrings( selector, context ).join('');
};

XMLWrapper.prototype.toStrings = function( selector, context )
{
	var returnValue = [ ];
		this.getElements( selector, context ).each( function( node ){
			returnValue.push(  new XMLSerializer( ).serializeToString( node ));
		});
	return returnValue;
};

XMLWrapper.prototype.insert = function( selector, newTag, nextSibling, context )
{
	if ( typeof( nextSibling ) == 'string' )
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
};

XMLWrapper.prototype.getElement = function( selector, context )
{
	if ( typeof( selector ) != 'string' ) return selector;
			var elements = this.getElements( selector, context );
	if ( elements.length )
		return elements[ 0 ];
	return null;
};

XMLWrapper.prototype.getElements = function( selector, context )
{
	if ( typeof( selector ) != 'string' ) return selector;
	if ( typeof( context ) == 'string' ) context = this.getElement( context );
	context = ( context ) ? context : this.doc;
//	if ( this.doc.evaluate )
//		return this.doc.evaluate( selector, context, null, 0, null );
	return xpathEval( selector, new ExprContext( context )).value
};

XMLWrapper.prototype.getValue = function( selector, context )
{
	var node = this.getElement( selector, context );
	return xmlValue( node );
};

XMLWrapper.prototype.setValue = function( selector, text, context )
{
	selector = this.getElement( selector, context );
	while( selector.firstChild ) selector.removeChild( selector.firstChild )
	if ( text )
		selector.appendChild( this.doc.createTextNode( text ));
	return selector;
};

XMLWrapper.prototype.getValues = function( selector, context )
{
	var returnValue = [ ];
	var elements = this.getElements( selector, context );
	for ( var i=0; i < elements.length; i++ )
		returnValue.push( xmlValue( elements[ i ] ) )
	return returnValue;
};

XMLWrapper.prototype.setValues = function( selector, textArray, context )
{
	selector = this.getElements( selector, context );
	for( var i=0; i < Math.min( textArray.length, selector.length ); i++ )
	{
		while( selector[i].firstChild ) selector[i].removeChild( selector[i].firstChild )
		selector[i].appendChild( this.doc.createTextNode( textArray[ i ] ));
	}
	return selector;
};

XMLWrapper.prototype.getTagName = function( selector, context )
{
	var returnvalue =  getElement( selector, context )
	return ( returnvalue ) ? returnvalue.tagName : null;
};

XMLWrapper.prototype.getTagNames = function( selector, context )
{
	var tags = this.getElements( selector, context );
	var returnvalue = [ ];
	for( var i=0; i < tags.length; i++ )
		returnvalue.push( tags[ i ].tagName );
	return returnvalue;
};

XMLWrapper.prototype.removeElement = function( selector, context )
{
	selector = this.getElement( selector, context )
	selector.parentNode.removeChild( selector );
	return selector;
};

XMLWrapper.prototype.removeElements = function( selector, context )
{
	selector = this.getElements( selector, context );
	for( var i=0; i < selector.length; i++ )
		selector[i].parentNode.removeChild( selector[i] )
	return selector;
};

XMLWrapper.prototype.getContent =  function( selector, context )
{
	return this.getContents( selector, context ).join( '' );
};

XMLWrapper.prototype.getContents = function( selector, context )
{
	var strings = this.toStrings( selector, context );
	for ( i=0; i < strings.length; i++ )
		strings[ i ] = /[^>]*>(.*)<[^<]*/.exec( strings[ i ]  )[1];
			return strings;
};


if ( /MSIE (\d+\.\d+);/.test(navigator.userAgent) && !window.opera ) // IE
{
		XMLSerializer = function( ){ return this };
		XMLSerializer.prototype.serializeToString = function( xmlDoc ){ return xmlDoc.xml };
}


