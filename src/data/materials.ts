/**
 * Materials are loot dropped by wild/abandoned mechas in the Junkyard.
 * They have no in-combat use — they exist to be sold at the Market for credits.
 * Later they could become crafting ingredients.
 */

export interface Material {
  id: string;
  name: string;
  sellPrice: number;        // credits paid at the market
  desc: string;
}

export const MATERIALS: Record<string, Material> = {
  scrap_metal:  { id: 'scrap_metal',  name: 'Scrap Metal',       sellPrice: 25, desc: 'Bent, oxidized, but salvageable.' },
  copper_wire:  { id: 'copper_wire',  name: 'Copper Wire',       sellPrice: 40, desc: 'Pulled from old wiring looms.' },
  salvaged_plate:{id: 'salvaged_plate',name: 'Salvaged Plate',   sellPrice: 80, desc: 'Hull fragment, mostly intact.' },
  cracked_core: { id: 'cracked_core', name: 'Cracked Core',      sellPrice: 150,desc: 'A reactor cell. Probably stable.' },
  bio_residue:  { id: 'bio_residue',  name: 'Bio Residue',       sellPrice: 60, desc: 'Sap from a feral pollen-frame.' },
  spark_capacitor:{id:'spark_capacitor',name:'Spark Capacitor',  sellPrice: 120,desc: 'Still holds a charge. Mostly.' },
};

export const MATERIAL_LIST = Object.values(MATERIALS);
