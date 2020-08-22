import { Vector2 } from '../math/Vector2.js';
import { MeshStandardMaterial } from './MeshStandardMaterial.js';
import { Color } from '../math/Color.js';
import brdfCloth from './clothBRDF.js';

/**
 * parameters = {
 *  clearcoat: <float>,
 *  clearcoatMap: new THREE.Texture( <Image> ),
 *  clearcoatRoughness: <float>,
 *  clearcoatRoughnessMap: new THREE.Texture( <Image> ),
 *  clearcoatNormalScale: <Vector2>,
 *  clearcoatNormalMap: new THREE.Texture( <Image> ),
 *
 *  reflectivity: <float>,
 *
 *  sheen: <Color>,
 *
 *  transmission: <float>,
 *  transmissionMap: new THREE.Texture( <Image> ),
 *
 *  subsurfaceColor: <Vector3>,
 * }
 */

function MeshClothMaterial( parameters ) {

	MeshStandardMaterial.call( this );

	this.defines = {

		'STANDARD': '',
		'CLOTH': '',
		'SUBSURFACE': ''

	};

	this.type = 'MeshClothMaterial';

	this.clearcoat = 0.0;
	this.clearcoatMap = null;
	this.clearcoatRoughness = 0.0;
	this.clearcoatRoughnessMap = null;
	this.clearcoatNormalScale = new Vector2( 1, 1 );
	this.clearcoatNormalMap = null;

	this.reflectivity = 0.5; // maps to F0 = 0.04

	this.sheen = null; // null will disable sheen bsdf

	this.transmission = 0.0;
	this.transmissionMap = null;
	this.subsurfaceColor = new Color( 0xffffff );

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
		'CLOTH': '',
		'SUBSURFACE': ''

	};

	this.clearcoat = source.clearcoat;
	this.clearcoatMap = source.clearcoatMap;
	this.clearcoatRoughness = source.clearcoatRoughness;
	this.clearcoatRoughnessMap = source.clearcoatRoughnessMap;
	this.clearcoatNormalMap = source.clearcoatNormalMap;
	this.clearcoatNormalScale.copy( source.clearcoatNormalScale );

	this.reflectivity = source.reflectivity;

	if ( source.sheen ) {

		this.sheen = ( this.sheen || new Color() ).copy( source.sheen );

	} else {

		this.sheen = null;

	}

	this.transmission = source.transmission;
	this.transmissionMap = source.transmissionMap;

	if ( source.subsurfaceColor ) {

		this.subsurfaceColor = ( this.subsurfaceColor || new Color() ).copy( source.subsurfaceColor );

	} else {

		this.subsurfaceColor = null;

	}

	if ( source.brdfCloth ) {

		this.brdfCloth = source.brdfCloth;

	} else {

		this.brdfCloth = null;

	}

	return this;

};

export { MeshClothMaterial };
