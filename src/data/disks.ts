import type { MechaType } from './types';

export type DiskKind = 'stat' | 'attack';
export type StatTarget = 'attack' | 'defense' | 'speed';

export interface DiskBase {
  id: string;
  name: string;
  kind: DiskKind;
  price: number;
  desc: string;
}

export interface StatDisk extends DiskBase {
  kind: 'stat';
  stat: StatTarget;
  value: number;
}

export interface AttackDisk extends DiskBase {
  kind: 'attack';
  attack: string;                // attack id
  requiresType?: MechaType;      // only this type can install it
}

export type Disk = StatDisk | AttackDisk;

export const DISKS: Record<string, Disk> = {
  // ---- STAT DISKS ----
  stat_atk_1: { id: 'stat_atk_1', name: 'ATK Stat Disk · I', kind: 'stat', stat: 'attack',  value: 3, price: 250, desc: '+3 ATK permanent.' },
  stat_def_1: { id: 'stat_def_1', name: 'DEF Stat Disk · I', kind: 'stat', stat: 'defense', value: 3, price: 250, desc: '+3 DEF permanent.' },
  stat_spd_1: { id: 'stat_spd_1', name: 'SPD Stat Disk · I', kind: 'stat', stat: 'speed',   value: 3, price: 250, desc: '+3 SPD permanent.' },
  stat_atk_2: { id: 'stat_atk_2', name: 'ATK Stat Disk · II', kind: 'stat', stat: 'attack',  value: 6, price: 700, desc: '+6 ATK permanent.' },
  stat_def_2: { id: 'stat_def_2', name: 'DEF Stat Disk · II', kind: 'stat', stat: 'defense', value: 6, price: 700, desc: '+6 DEF permanent.' },
  stat_spd_2: { id: 'stat_spd_2', name: 'SPD Stat Disk · II', kind: 'stat', stat: 'speed',   value: 6, price: 700, desc: '+6 SPD permanent.' },

  // ---- ATTACK DISKS - universal ----
  atk_disk_strike: { id: 'atk_disk_strike', name: 'Strike Disk', kind: 'attack', attack: 'basic_strike', price: 400, desc: 'Teach Basic Strike.' },
  atk_disk_jab:    { id: 'atk_disk_jab',    name: 'Jab Disk',    kind: 'attack', attack: 'quick_jab',    price: 600, desc: 'Teach Quick Jab.' },

  // ---- ATTACK DISKS - type-locked ----
  atk_disk_ember:  { id: 'atk_disk_ember',  name: 'Ember Disk',  kind: 'attack', attack: 'ember_punch',  requiresType: 'fire',      price: 900,  desc: 'Teach Ember Punch (Fire only).' },
  atk_disk_jet:    { id: 'atk_disk_jet',    name: 'Jet Disk',    kind: 'attack', attack: 'water_jet',    requiresType: 'water',     price: 900,  desc: 'Teach Water Jet (Water only).' },
  atk_disk_spark:  { id: 'atk_disk_spark',  name: 'Spark Disk',  kind: 'attack', attack: 'spark',        requiresType: 'lightning', price: 900,  desc: 'Teach Spark (Lightning only).' },
  atk_disk_frost:  { id: 'atk_disk_frost',  name: 'Frost Disk',  kind: 'attack', attack: 'frostbite',    requiresType: 'ice',       price: 1200, desc: 'Teach Frostbite (Ice only).' },
  atk_disk_quake:  { id: 'atk_disk_quake',  name: 'Quake Disk',  kind: 'attack', attack: 'quake_slam',   requiresType: 'earth',     price: 1200, desc: 'Teach Quake Slam (Earth only).' },
  atk_disk_spore:  { id: 'atk_disk_spore',  name: 'Spore Disk',  kind: 'attack', attack: 'spore_lash',   requiresType: 'bio',       price: 1200, desc: 'Teach Spore Lash (Bio only).' },
  atk_disk_rivet:  { id: 'atk_disk_rivet',  name: 'Rivet Disk',  kind: 'attack', attack: 'rivet_punch',  requiresType: 'steel',     price: 1200, desc: 'Teach Rivet Punch (Steel only).' },
  atk_disk_neuro:  { id: 'atk_disk_neuro',  name: 'Neuro Disk',  kind: 'attack', attack: 'neurospike',   requiresType: 'mental',    price: 1200, desc: 'Teach Neurospike (Mental only).' },
};

export const DISK_LIST = Object.values(DISKS);
