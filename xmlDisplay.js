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

XMLDisplay = [ ];

XMLWrapper.prototype.display = function( htmlElement )
{
	var divElement = document.createElement( 'div' );
	XMLDisplay.addStyle( );
	return XMLDisplay.load( divElement, this.doc.lastChild, 0 );
}

XMLDisplay.load = function( outerContainer, element ){
	if ( element.tagName )
	{
		var openTag = document.createElement( 'div' )
		openTag.className = 'xml_openTag';
		var tagText = '<'+element.tagName
		// attributes go here
		for ( var i=0; i < element.attributes.length; i++ )
		{
			tagText += ' '+element.attributes[ i ].nodeName+'="'+element.attributes[ i ].value+'"';
		}
		if ( !element.childNodes.length )
		{
			tagText += '/';
			openTag.className = "xml_emptyTag"
		}
		else 
		{
			if ( openTag.addEventListener )
				openTag.addEventListener( 'click', XMLDisplay.toggleCollapsed, false );
			else
				openTag.onclick = XMLDisplay.toggleCollapsed;
		}
		tagText += '>'
		openTag.appendChild( document.createTextNode( tagText ));
		outerContainer.appendChild( openTag );
	}
	else
	{
		var textNode = document.createElement( 'div' );
		textNode.className = 'xml_textNode';
		textNode.appendChild( document.createTextNode( element.nodeValue ));
		outerContainer.appendChild( textNode );

	}
	var container = document.createElement( 'div' );
	container.className = 'xml_container';
	if ( element.childNodes.length )
	{
		for ( var i=0; i < element.childNodes.length; i++ )
			XMLDisplay.load( container, element.childNodes[ i ] );
		outerContainer.appendChild( container );
		if ( element.tagName )
		{
			var closeTag = document.createElement( 'div' )
			closeTag.className = 'xml_closeTag';
			var tagText = '</'+element.tagName
			tagText += '>'
			closeTag.appendChild( document.createTextNode( tagText ));
			outerContainer.appendChild( closeTag );
		}
	}
	return outerContainer;
}


XMLDisplay.toggleCollapsed = function( )
{
	var next = this;
	if ( /\bxml_collapsed\b/.test( this.className ))
	{
		this.className = this.className.replace( /xml_collapsed/g, '' );
		do {
			(next = next.nextSibling).style.display='';
		} while( !/\bxml_closeTag\b/.test( next.className ));
	}
	else
	{
		this.className += ' xml_collapsed';
		do {
			(next = next.nextSibling).style.display='none';
		} while( !/\bxml_closeTag\b/.test( next.className ));
	}
}

XMLDisplay.addStyle = function( ){
	if ( XMLDisplay.style ) return XMLDisplay.style;
	var styleString = ".xml_container{padding-left:15px;border-left:1px solid #ddd}.xml_openTag,.xml_closeTag,.xml_emptyTag{font-weight:bold;color:#408;}.xml_openTag:hover{color:#0f0;cursor:pointer}.xml_emptyTag{color:#999;}.xml_collapsed{color:#f00;}";
	XMLDisplay.style = document.createElement( 'style' );
	XMLDisplay.style.setAttribute( 'type', 'text/css' )
	XMLDisplay.style.id = 'XMLDisplayStyle';
	if ( /MSIE/.test( navigator.userAgent ) && !window.opera ) XMLDisplay.style.styleSheet.cssText = styleString;
	else XMLDisplay.style.appendChild( document.createTextNode( styleString ));
	var head = document.getElementsByTagName( 'head' )[ 0 ];
	var i = 0;
	while ( head.childNodes[ i ] && ( !head.childNodes[ i ].tagName || ( head.childNodes[ i ].tagName.toLowerCase( ) != 'style' && head.childNodes[ i ].tagName.toLowerCase( ) != 'link' ))) 
		i++; 
	head.insertBefore( XMLDisplay.style, ( head.childNodes[ i ] ) ? head.childNodes[ i ] : null );
	return XMLDisplay.style;
}
