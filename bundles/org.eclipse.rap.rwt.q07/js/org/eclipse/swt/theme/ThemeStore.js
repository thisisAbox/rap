/*******************************************************************************
 * Copyright (c) 2007, 2011 Innoopract Informationssysteme GmbH.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Innoopract Informationssysteme GmbH - initial API and implementation
 *     EclipseSource - ongoing development
 ******************************************************************************/


/**
 * Store for theme values that cannot be kept in a qooxdoo theme. The store is
 * filled from the server at startup.
 */
qx.Class.define( "org.eclipse.swt.theme.ThemeStore", {

  type : "singleton",

  extend : qx.core.Object,

  construct : function() {
    this._values = {
      dimensions : {},
      boxdims : {},
      images : {},
      gradients : {},
      fonts : {},
      colors : {},
      borders : {},
      cursors : {},
      animations : {}
    };
    this._cssValues = {};
    this._statesMap = {
      "*" : {
        "hover" : "over"
      },
      "DateTime-Calendar-Day" : {
        "unfocused" : "parent_unfocused"
      },
      "List-Item" : {
        "unfocused" : "parent_unfocused"
      },
      "Text" : {
        "read-only" : "readonly"
      },
      "TreeItem" : {
        "unfocused" : "parent_unfocused"
      },
      "TreeColumn" : {
        "hover" : "mouseover"
      },
      "Shell" : {
        "inactive" : "!active"
      },
      "Shell-Titlebar" : {
        "inactive" : "!active"
      },
      "Shell-MinButton" : {
        "inactive" : "!active"
      },
      "Shell-MaxButton" : {
        "inactive" : "!active"
      },
      "Shell-CloseButton" : {
        "inactive" : "!active"
      },
      "TableColumn" : {
        "hover" : "mouseover"
      },
      "TableItem" : {
        "unfocused" : "parent_unfocused"
      },
      "TabItem" : {
        "selected" : "checked"
      }
    };
  },

  members : {

    /////////////
    // Server API

    defineValues : function( values ) {
      for( var type in this._values ) {
        if( type in values ) {
          for( key in values[ type ] ) {
            if( !( key in this._values[ type ] ) ) {
              this._values[ type ][ key ] = values[ type ][ key ];
            }
          }
        }
      }
    },

    setThemeCssValues : function( theme, values, isDefault ) {
      if( this._cssValues[ theme ] === undefined ) {
        this._cssValues[ theme ] = values;
      }
      if( isDefault ) {
        this.defaultTheme = theme;
      }
      this._fillColors( theme );
    },

    /////////////
    // Client API

    getColor : function( element, states, property, theme ) {
      var key = this._getCssValue( element, states, property, theme );
      return this._values.colors[ key ];
    },
    
    getDimension : function( element, states, property, theme ) {
      var key = this._getCssValue( element, states, property, theme );
      return this._values.dimensions[ key ];
    },
    
    getBoxDimensions : function( element, states, property, theme ) {
      var key = this._getCssValue( element, states, property, theme );
      return this._values.boxdims[ key ];
    },

    getBoolean : function( element, states, property, theme ) {
      return this._getCssValue( element, states, property, theme );
    },

    getFloat : function( element, states, property, theme ) {
      return parseFloat( this._getCssValue( element, states, property, theme ) );
    },

    getIdentifier : function( element, states, property, theme ) {
      return this._getCssValue( element, states, property, theme );
    },
    
    getImage : function( element, states, property, theme ) {
      var key = this._getCssValue( element, states, property, theme );
      var imageArray = this._values.images[ key ];
      if( imageArray != null ) {
        // TODO [rh] remove hard-coded path (first segment is defined by 
        //      resource-manager)
        result = "rwt-resources/themes/images/" + imageArray[ 0 ];
      } else {
        // TODO [rst] Handle null values - currently, both null and the string
        // "undefined" lead to a js error for icon property
        result = org.eclipse.swt.theme.ThemeValues.NONE_IMAGE;
      }
      return result;
    },
    
    getSizedImage : function( element, states, property, theme ) {
      var key = this._getCssValue(  element, states, property, theme );
      var imageArray = this._values.images[ key ];
      var result;
      if( imageArray != null ) {
        // TODO [tb] : Revise hardcoded path
        result = imageArray.concat(); // creates copy
        result[ 0 ] = "rwt-resources/themes/images/" + result[ 0 ];
      } else {
        result = org.eclipse.swt.theme.ThemeValues.NONE_IMAGE_SIZED;        
      } 
      return result; 
    },
    
    getCursor : function( element, states, property, theme ) {
      var key = this._getCssValue(  element, states, property, theme );
      var result = this._values.cursors[ key ];
      if( key === result ) {
        result = "rwt-resources/themes/cursors/" + result;
      }
      return result;
    },

    getAnimation : function( element, states, property, theme ) {
      var key = this._getCssValue( element, states, property, theme );
      return this._values.animations[ key ];
    },

    getFont : function( element, states, property, theme ) {
      var key = this._getCssValue( element, states, property, theme );
      var value = this._values.fonts[ key ];
      if( !( value instanceof qx.ui.core.Font ) ) {
        var font = new qx.ui.core.Font();
        font.setSize( value.size );
        font.setFamily( value.family );
        font.setBold( value.bold );
        font.setItalic( value.italic );
        this._values.fonts[ key ] = font;
      }
      return this._values.fonts[ key ];
    },

    getBorder : function( element, states, property, theme ) {
      var key = this._getCssValue( element, states, property, theme );
      var value = this._values.borders[ key ];
      var border;
      if( !( value instanceof qx.ui.core.Border ) && typeof( value ) !== "string" ) {
        border = this._convertBorderValueToPreset( value );
        if( border === null ) {
          border = new qx.ui.core.Border( value.width, value.style, value.color );
          this._values.borders[ key ] = border;
        }
      } else {
        border = value;
      }
      if( typeof( border ) !== "string" ) {
        var radiiKey = this._getCssValue( element, states, "border-radius", theme );
        var radii = this._values.boxdims[ radiiKey ];
        if( radii != null && ( radii.join( "" ) !== "0000" ) ) {
          // TODO [tb]: Rounded borders can currently not be easily cached 
          //            due to their dependence on (independently usable) non-rounded border.
          var width = border.getWidthTop();
          var color = border.getColorTop();
          border = new org.eclipse.rwt.RoundedBorder( width, color, radii );
        }
      }
      return border;
    },

    getGradient : function( element, states, property, theme ) {
      var key = this._getCssValue( element, states, property, theme );
      var value = this._values.gradients[ key ];
      if( value != null ) {
        // TODO [if] remove this check when values are rendered only once
        if( value.colors && value.percents ) {
          var gradient = new Array();
          for( var i = 0; i < value.colors.length; i++ ) {
            gradient[ i ] = [ value.percents[ i ] / 100, 
                              value.colors[ i ] ];
          }
          gradient.horizontal = !value.vertical;
          this._values.gradients[ key ] = gradient;
        }
      }
      return this._values.gradients[ key ];
    },
    

    // Used by GraphicsMixin:
    getImageSize : function( source ) {
      var key = source.slice( "rwt-resources/themes/images/".length );
      var image = this._values.images[ key ];      
      return image != null ? [ image[ 1 ], image[ 2 ] ] : [ 0, 0 ];
    },

    
    ////////////
    // Internals
    
    _getCssValue : function( element, states, property, theme ) {
      var result;
      if( theme == null ) {
        theme = qx.theme.manager.Meta.getInstance().getTheme().name;
      }
      if(    this._cssValues[ theme ] !== undefined
          && this._cssValues[ theme ][ element ] !== undefined 
          && this._cssValues[ theme ][ element ][ property ] !== undefined )
      {
        var values = this._cssValues[ theme ][ element ][ property ];
        var found = false;
        for( var i = 0; i < values.length && !found; i++ ) {
          if( this._matches( states, element, values[ i ][ 0 ] ) ) {
            result = values[ i ][ 1 ];
            found = true;
          }
        }
      }
      if( result === undefined && theme != this.defaultTheme ) {
        result = this._getCssValue( element, states, property, this.defaultTheme );
      }
      return result;
    },
    
    _matches : function( states, element, constraints ) {
      var result = true;
      for( var i = 0; i < constraints.length && result; i++ ) {
        var cond = constraints[ i ];
        if( cond.length > 0 ) {
          var c = cond.charAt( 0 );
          if( c == "." ) {
            result = "variant_" + cond.substr( 1 ) in states;
          } else if( c == ":" ) {
            var state = this._translateState( cond.substr( 1 ), element );
            if( state.charAt( 0 ) == "!" ) {
              result = ! ( state.substr( 1 ) in states );
            } else {
              result = state in states;
            }
          } else if( c == "[" ) {
            result = "rwt_" + cond.substr( 1 ) in states;
          }
        }
      }
      return result;
    },

    _translateState : function( state, element ) {
      var result = state;
      if( element in this._statesMap && state in this._statesMap[ element ] ) {
        result = this._statesMap[ element ][ state ];
      } else if( state in this._statesMap[ "*" ] ) {
        result = this._statesMap[ "*" ][ state ];
      }
      return result;
    },
    
    // Fills qx color theme with some named colors necessary for BordersBase
    _fillColors : function( theme ) {
      var ct = qx.Theme.getByName( theme + "Colors" );
      ct.colors[ "widget.darkshadow" ]
        = this.getColor( "Display", {}, "rwt-darkshadow-color", theme );
      ct.colors[ "widget.highlight" ]
        = this.getColor( "Display", {}, "rwt-highlight-color", theme );
      ct.colors[ "widget.lightshadow" ]
        = this.getColor( "Display", {}, "rwt-lightshadow-color", theme );
      ct.colors[ "widget.shadow" ]
        = this.getColor( "Display", {}, "rwt-shadow-color", theme );
      ct.colors[ "widget.thinborder" ]
        = this.getColor( "Display", {}, "rwt-thinborder-color", theme );
      // TODO [rst] eliminate these properties
      ct.colors[ "widget.selection-marker" ]
        = this.getColor( "Display", {}, "rwt-selectionmarker-color", theme );
      ct.colors[ "widget.background" ]
        = this.getColor( "*", {}, "background-color", theme );
      ct.colors[ "widget.foreground" ]
        = this.getColor( "*", {}, "color", theme );
      ct.colors[ "widget.info.foreground" ]
        = this.getColor( "Widget-ToolTip", {}, "color", theme );
    },
    
    _convertBorderValueToPreset : function( value ) {
      var result = null;
      if( value.color == null ) {
        if( value.width == 1 ) {
          if( value.style == "outset" ) {
            result = "thinOutset";
          } else if( value.style == "inset" ) {
            result = "thinInset";
          }
        } else if( value.width == 2 ) {
          if( value.style == "outset" ) {
            result = "outset";
          } else if( value.style == "inset" ) {
            result = "inset";
          } else if( value.style == "ridge" ) {
            result = "ridget";
          } else if( value.style == "groove" ) {
            result = "groove";
          }
        }
      }
      return result;
    }

  }
} );
