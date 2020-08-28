import { Vector2 } from '../math/Vector2.js';
import { MeshStandardMaterial } from './MeshStandardMaterial.js';
import { Color } from '../math/Color.js';
import brdfCloth from './clothBRDF.js';

/**
 * parameters = {
 *  reflectivity: <float>,
 *
 *  sheen: <Color>,
 *
 *  transmission: <float>,
 *  transmissionMap: new THREE.Texture( <Image> ),
 *
 *  subsurface: <Vector3>,
 * }
 */

function MeshClothMaterial( parameters ) {

	MeshStandardMaterial.call( this );

	this.defines = {

		'STANDARD': '',
		'CLOTH': ''

	};

	this.type = 'MeshClothMaterial';
	this.sheen = null;

	this.transmission = 0.0;
	this.transmissionMap = null;
	this.subsurface = null;

	this.brdfCloth = brdfCloth;

	this.setValues( parameters );

}

MeshClothMaterial.prototype = Object.create( MeshStandardMaterial.prototype );
MeshClothMaterial.prototype.constructor = MeshClothMaterial;

MeshClothMaterial.prototype.isMeshClothMaterial = true;

MeshClothMaterial.prototype.copy = function ( source ) {

	MeshStandardMaterial.prototype.copy.call( this, source );

	this.defines = {

		'STANDARD': '',
		'CLOTH': ''

	};

	if ( source.sheen ) {

		this.sheen = ( this.sheen || new Color() ).copy( source.sheen );

	}

	this.transmission = source.transmission;
	this.transmissionMap = source.transmissionMap;

	if ( source.subsurface ) {

		this.subsurface = ( this.subsurface || new Color() ).copy( source.subsurface );

	} else {

		this.subsurface = null;

	}

	if ( source.brdfCloth ) {

		this.brdfCloth = source.brdfCloth;

	} else {

		this.brdfCloth = null;

	}

	return this;

};

export { MeshClothMaterial };
