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
		if ( !element.childNodes.length )
		{
			tagText += '/';
			openTag.className = "xml_emptyTag"
		}
		else openTag.onclick = XMLDisplay.toggleCollapsed
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
	if ( /\bxml_collapsed\b/.exec( this.className ))
		this.className = this.className.replace( /xml_collapsed/g, '' );
	else
		this.className += ' xml_collapsed';
}

XMLDisplay.addStyle = function( ){
	if ( XMLDisplay.style ) return XMLDisplay.style;
	var styleString = ".xml_container{padding-left:15px;border-left:1px solid #aaa}.xml_openTag,.xml_closeTag,.xml_emptyTag{font-weight:bold;color:#408;}.xml_openTag:hover{color:#0f0;cursor:pointer}.xml_emptyTag{color:#999;}.xml_collapsed{color:#f00;}.xml_openTag.xml_collapsed+.xml_container,.xml_openTag.xml_collapsed+.xml_container+.xml_closeTag{display:none;}";
	XMLDisplay.style = document.createElement( 'style' );
	XMLDisplay.style.setAttribute( 'type', 'text/css' )
	XMLDisplay.style.id = 'XMLDisplayStyle';
	if ( /MSIE/.test( navigator.useragent )) XMLDisplay.style.styleSheet.cssText = styleString;
	else XMLDisplay.style.appendChild( document.createTextNode( styleString ));
	var head = document.getElementsByTagName( 'head' )[ 0 ];
	var i = 0;
	while ( head.childNodes[ i ] ) { 
		if ( head.childNodes[ i ].tagName == 'style' || head.childNodes[ i ].tagName == 'link' ) break; 
		i++; 
	}
	head.insertBefore( XMLDisplay.style, head.childNodes[ i ] );
//	head.appendChild( XMLDisplay.style );
	return XMLDisplay.style;
}
