const escapeMsg = (msg) => msg
  .replace(/-/g, "\\-")
  .replace(/_/g, "\\_")
  .replace(/`/g, "\\`")
  .replace(/\./g, "\\.");

const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];

const abbreviateNumber = (number) => {
  number = parseInt(number) / Math.pow(10, 18); // Math.pow(10, 18) for handle strange response numbers
  const tier = Math.log10(number) / 3 | 0;

  if (tier === 0) return number;

  const suffix = SI_SYMBOL[tier];
  const scale = Math.pow(10, tier * 3);

  const scaled = number / scale;

  return scaled.toFixed(1) + suffix;
}

function hasOwner(owner) {
  return owner !== "0x0000000000000000000000000000000000000000";
};

function getEnergyAtTime(energyLazy, energyGrowth, energyCap, timeElapsed, owner) {
  if (energyLazy === 0) {
      return 0;
  }
  if (!hasOwner(owner)) {
      return energyLazy;
  }
  /*if (planet.planetType === PlanetType.SILVER_BANK) {
    if (planet.energy > planet.energyCap) {
      return planet.energyCap;
    }
  }*/
  const denominator =
      Math.exp((-4 * energyGrowth * timeElapsed) / energyCap) *
      (energyCap / energyLazy - 1) +
      1;
  return energyCap / denominator;
}


function getSilverOverTime(silverLazy, silverGrowth, silverCap, timeElapsed, owner) {
  if (!hasOwner(owner)) {
      return silverLazy;
  }

  if (silverLazy > silverCap) {
      return silverCap;
  }

  return Math.min(
      timeElapsed * silverGrowth + silverLazy,
      silverCap
  );
}

function planetTypeToName(type) {
  switch (type) {
    case "PLANET":
      return "Planet";
    case "RUINS":
      return "Foundry";
    case "SILVER_BANK":
      return "Quasar";
    case "SILVER_MINE":
      return "Asteroid";
    case "TRADING_POST":
      return "Spacetime Rip";
    default:
      return "Unknown";
  }
}

function getPlanetShortHash(planet) {
  if (!planet) return '00000';
  else return planet.locationId.substring(4, 9);
};

function getPlanetRank (planet) {
  //if (!planet) return 0;
  return planet.reduce((a, b) => a + b);
}; 

function formatNumber (num, smallDec) {
  if (num < 1000) {
    if (`${num}` === num.toFixed(0)) {
      return `${num.toFixed(0)}`;
    } else {
      return `${num.toFixed(smallDec)}`;
    }
  }

  const suffixes = ['', 'K', 'M', 'B', 'T', 'q', 'Q'];
  let log000 = 0;
  let rem = num;
  while (rem / 1000 >= 1) {
    rem /= 1000;
    log000++;
  }

  if (log000 === 0) return `${Math.floor(num)}`;

  if (rem < 10) return `${rem.toFixed(1)}${suffixes[log000]}`;
  else if (rem < 100) return `${rem.toFixed(1)}${suffixes[log000]}`;
  else if (log000 < suffixes.length) return `${rem.toFixed(0)}${suffixes[log000]}`;
  else return `${rem.toFixed(0)}E${log000 * 3}`;
};

function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return hDisplay + mDisplay + sDisplay; 
};

module.exports = {
  escapeMsg: escapeMsg,
  abbreviateNumber: abbreviateNumber,
  getEnergyAtTime: getEnergyAtTime,
  getSilverOverTime: getSilverOverTime,
  planetTypeToName: planetTypeToName,
  getPlanetRank: getPlanetRank,
  formatNumber: formatNumber,
  secondsToHms: secondsToHms
}