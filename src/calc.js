import moment from 'moment'

const infectedPeople = (people, percent, infmin, toggleInf) => {
  const percentPeople = people * (percent / 100)
  const infected = toggleInf ? percentPeople : infmin
  return infected
}

// Gaussian distribution functionality
const gaussianDistribution = (nPeople = 10, t_max = 60, t = 0) => {
  const a = nPeople
  const b = t_max / 2
  const c = t_max / 6
  return a * Math.pow(Math.E, -Math.pow(t - b, 2) / Math.pow(2 * c, 2))
}

// Default values
const roomCalculation = (
  Ar = 100,
  Hr = 3,
  sACHType = 1,
  infPercent = 1,
  inf_min = 1,
  n_people = 10,
  EH = 0,
  Vli = 8,
  maskType = 0,
  activityType = 0,
  maskTypeSick = 0,
  activityTypeSick = 0,
  cutoffType = 0,
  verticalvType = 0,
  occupancyType = 0,
  customBreakDate = '12:30',
  t_customBreak = 60,
  startDate = '09:00',
  endDate = '17:00',
  ACHcustom = 0,
  sFilterType = 0,
  outsideAir = 100,
  infChecked = 'false'
) => {
  // Convert Time start - end to duration
  const t_max =
    60 *
    moment(`2000-01-02 ${endDate}`).diff(
      (endDate >= startDate) ? moment(`2000-01-02 ${startDate}`) : moment(`2000-01-01 ${startDate}`),
      'hours',
      true
    )

  const breakWhen =
    3600 *
    moment(`2000-01-02 ${customBreakDate}`).diff(
      (customBreakDate >= startDate) ? moment(`2000-01-02 ${startDate}`) : moment(`2000-01-01 ${startDate}`),
      'hours',
      true
    )

  // People over time
  const peopleInst = (t_max, t) => {
    const people =
      occupancyType === 0 ? n_people : gaussianDistribution(n_people, t_max, t)
    const infected = infectedPeople(people, infPercent, inf_min, infChecked)
    const hasBreak =
      t >= breakWhen && t < breakWhen + 60 * t_customBreak ? 0.0 : 1.0
    return {
      people: people * hasBreak,
      infected: infected * hasBreak
    }
  }

  // Filter in the ventilation system based on the modes set at the interface
  // These values of filter efficiency need changing according to
  // https://www.venfilter.com/normativa/comparative-guide-norms-classification-air-filters
  // Types are: (i) none - 0% (ii) HEPA () -%
  //            (iii) ISO ePM1 -% (iv) ISO ePM2.5 -% (v) ISO ePM10 -% (vi) ISO coarse -%

  //-------------------------------
  // Fraction of suspended virus (PFU) in each class in %
  //-------------------------------
  // Rows: cut-off diameter
  // Columns: [0.3-1um],[1-2.5um],[2.5-5um],[5-10um],[10-20um],[20-40um],[40-100um]
  //-------------------------------
  // Vertical velocity = 0 m/s
  //0.1384    5.8893   93.9723       NaN       NaN       NaN       NaN
  //0.0086    0.3673    5.8605   93.7636       NaN       NaN       NaN
  //0.0007    0.0293    0.4682    7.4907   92.0111       NaN       NaN
  //0.0001    0.0022    0.0358    0.5730    9.1790   90.2099       NaN
  //0.0000    0.0004    0.0059    0.0947    1.5175   23.9912   74.3903
  //-------------------------------
  // Vertical velocity = 0.1 m/s
  //0.1384    5.8893   93.9723       NaN       NaN       NaN       NaN
  //0.0086    0.3673    5.8605   93.7636       NaN       NaN       NaN
  //0.0005    0.0229    0.3658    5.8529   93.7578       NaN       NaN
  //0.0000    0.0014    0.0227    0.3640    5.8303   93.7815       NaN
  //0.0000    0.0002    0.0037    0.0587    0.9411   15.1371   83.8592

  // Cuttoff first then velocity
  const PM1_base = [
    0.1384,
    0.0086,
    0.0007,
    0.0001,
    0.0,
    0.1384,
    0.0086,
    0.005,
    0.0,
    0.0
  ]
  const PM2d5_base = [
    5.8893,
    0.3673,
    0.0293,
    0.0022,
    0.0004,
    5.8893,
    0.3673,
    0.0229,
    0.0014,
    0.0002
  ]
  const PM5_base = [
    93.9723,
    5.8605,
    0.4682,
    0.0358,
    0.0059,
    93.9723,
    5.8605,
    0.3658,
    0.0227,
    0.0037
  ]
  const PM10_base = [
    0.0,
    93.7636,
    7.4907,
    0.573,
    0.0947,
    0.0,
    93.7636,
    5.8529,
    0.364,
    0.0587
  ]
  const PM20_base = [
    0.0,
    0.0,
    92.0111,
    9.179,
    1.5175,
    0.0,
    0.0,
    93.7578,
    5.8303,
    0.9411
  ]
  const PM40_base = [
    0.0,
    0.0,
    0.0,
    90.2099,
    23.9912,
    0.0,
    0.0,
    0.0,
    93.7815,
    15.1371
  ]
  const PM100_base = [0.0, 0.0, 0.0, 0.0, 74.3903, 0.0, 0.0, 0.0, 0.0, 83.8592]

  // we do not PM5, PM20 and PM40 since they are already accounted for in PM10, PM100 and PM100, respectively.
  const PM1 = PM1_base[cutoffType + 5 * verticalvType] / 100.0
  const PM2d5 = PM1 + PM2d5_base[cutoffType + 5 * verticalvType] / 100.0
  const PM5 = PM2d5 + PM5_base[cutoffType + 5 * verticalvType] / 100.0
  const PM10 = PM5 + PM10_base[cutoffType + 5 * verticalvType] / 100.0
  const PM20 = PM10 + PM20_base[cutoffType + 5 * verticalvType] / 100.0
  const PM40 = PM20 + PM40_base[cutoffType + 5 * verticalvType] / 100.0
  const PM100 = PM40 + PM100_base[cutoffType + 5 * verticalvType] / 100.0

  //-------------------------------
  // none
  // HEPA 99.5% efficient in PM1 class and 100% everywhere else
  // ePM1 (90%): 90% efficient in PM1 class and 100% everywhere else
  // ePM2.5 (90%): 90% efficient in PM2.5 class and 100% everywhere else
  // ePM10 (90%): 90% efficient in PM10 class and 100% everywhere else
  // ISO coarse: 40% efficient in PM10 class and 100% everywhere else
  //                       none HEPA   ePM1  ePM2.5  ePM10  coarse
  const sFilterPM1_base = [0, 99.5, 90.0, 90.0, 90.0, 40.0]
  const sFilterPM2d5_base = [0, 100.0, 100.0, 90.0, 90.0, 40.0]
  const sFilterPM10_base = [0, 100.0, 100.0, 100.0, 90.0, 40.0]
  const sFilterRest_base = [0, 100.0, 100.0, 100.0, 100.0, 100.0]

  // The efficiency is like a weighted average
  let filterEff =
    (sFilterPM1_base[sFilterType] / 100.0) * PM1 +
    (sFilterPM2d5_base[sFilterType] / 100.0) * (PM2d5 - PM1) +
    (sFilterPM10_base[sFilterType] / 100.0) * (PM10 - PM2d5) +
    (sFilterRest_base[sFilterType] / 100.0) * (PM100 - PM10)
  //The above filter applies only to recirculated air. Outside air varies between 0--100% (variable is outsideAir)

  // Sets ACH based on the modes set at the interface
  const sACH = [0.3, 1, 3, 5, 10, 20, 999]
  const ACH = sACHType === 6 ? ACHcustom : sACH[sACHType]

  // Decay rates
  // First five values are for zero vertical velocity and last five values are for 0.1 m/s upward vertical velocity
  // The indices are based on the aerosol cut-off diameter
  const kappa_base = [
    // gravitational settling rate , 1/h
    0.39,
    0.39,
    0.39,
    0.39,
    0.39,
    0,
    0,
    0,
    0,
    0
  ]
  let kappa = kappa_base[cutoffType + 5 * verticalvType] // ... set gravitational settling rate, 1/h
  let lambda = 0.636 // ... viral decay rate, 1/h

  // Define background CO2 (hope this does not change a lot...)
  const co2_background = 415 // ... CO2 outdoors, ppm

  // Base value for CO2 emission (based on https://doi.org/10.1111/ina.12383)
  //const H_forCO2 = 1.8; // height of individual, m
  //const W_forCO2 = 80; // weight of individual, kg
  //const AD_forCO2 = 0.202*Math.pow(H_forCO2,0.725)*Math.pow(W_forCO2,0.425); // DuBois surface area, m^2
  const AD_forCO2 = 1.8 // averaged size adult, DuBois surface area, m^2
  const RQ_forCO2 = 0.85 // respiratory quotient (dimensionless)
  const co2_exhRate_without_met =
    (0.00276 * AD_forCO2 * RQ_forCO2) / (0.23 * RQ_forCO2 + 0.77) // ltr/s/met
  const met_ref = 1.15 // reference metabolic rate, met
  const co2_exhRate_ref = co2_exhRate_without_met * met_ref // ... indicative CO2 emission rate, ltr/s

  // Metabolic rate applied to to co2_exhRate_ref (based on https://doi.org/10.1111/ina.12383).
  // (i) sitting/breathing, (ii) standing/light exercise, (iii) heavy exercise
  // in the paper these are taken for:
  // (i) average from range in sitting quietly 1.15 met (see met_ref above)
  // (ii) standing quietly,  light exercise  1.3 met
  // (iii) calisthenics, moderate effort 3.8 met
  const metabolic_rate_forCO2 = [met_ref, 1.3, 3.8] //  metabolic rate based on activity, met

  // Base value for inhalation rate
  const inhRate_pure = 0.521 // ... inhalation rate, ltr/s,

  // Activity multiplier applied to inhRate_pure
  // (i) sitting breathing, (ii) standing speaking, (iii) speaking loudly, (iv) heavy activity
  // from Buonanno et al 2020 (https://doi.org/10.1016/j.envint.2020.106112)
  // IR = 0.54 m3/h : sedentary activity
  // IR = 1.38 m3/h : <light exercise, unmodulated vocalization> or <light exercise, voiced counting>
  // IR = 3.3 m3/h : <heavy exercise, oral breathing>
  // in Activity_type_inh we I take ratios of IR but we keep the inhRate_pure the same as a reference
  const Activity_type_inh = [1, 2.5556, 6.1111] // multiplier for inhalation rate based on activity.

  // Base value for exhalation rate
  const exhRate_pure = 0.211 // ... exhlation rate for speaking from (Gupta et al., 2010), ltr/s

  // Activity multiplier applied to Ngen based on similar analysis with inhalation
  const Activity_type_Ngen = [1, 2.5556, 6.1111] // multiplier for exhalation rate based on activity.

  // Multiplier based on mask efficiency
  // No mask, N95, surgical and 3-ply cloth [medrxiv.org/content/10.1101/2020.10.05.20207241v1]
  // 90% for N95 for safety (see manual)
  // 1- ply cloth REF???
  const Mask_type = [0, 0.9, 0.59, 0.51, 0.35]

  // Conversions with applications of mask and activity to inhalation rate and CO2 emission
  // *** the exhalation equivalent for the virus is being accounted for in N_r
  let inhRate =
    inhRate_pure * (1 - Mask_type[maskType]) * Activity_type_inh[activityType] // ... actual inhlation rate, ltr/s
  let co2_exhRate =
    (co2_exhRate_ref * metabolic_rate_forCO2[activityType]) / met_ref // ... actual CO2 emission rate, ltr/s

  // Here we need an "effective" N_gen for aerosol particles
  // First five values are for zero vertical velocity and last five values are for 0.1 m/s upward vertical velocity
  // The indices are based on the aerosol cut-off diameter
  const Ngen_base = [
    0.4527,
    0.4843,
    0.589,
    5.1152,
    16.2196,
    0.4728,
    0.5058,
    0.647,
    8.6996,
    30.073
  ]
  // Find actual emission
  const base_N_r =
    (Activity_type_Ngen[activityTypeSick] *
      Ngen_base[cutoffType + 5 * verticalvType]) /
    Math.pow(10, 9)
  const Vl = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] // viral load exponent, copies/ml
  const N_r = Math.pow(10, Vl[Vli]) * base_N_r * (1 - Mask_type[maskTypeSick]) // ... effective aerosol emission rate, PFU/s

  // Risk is p(N_vs) = 1-exp(-N_vs/riskConst);
  let riskConst = 4.1e2 // ... constant for risk estimation, PFU

  // Additional variables
  const V = Ar * Hr // ... room volume, m^3
  const Vperson = Math.round((ACH / 3600) * (V * 1000) * (1 / n_people)) // ... ventilation rate, l/s/person

  // Conversions
  kappa = kappa / 3600 // ... 1/s
  lambda = lambda / 3600 // ... 1/s
  inhRate = inhRate / 1000 // ... m3/s

  const ACH_fresh = (ACH * outsideAir) / 100 // ...1/h
  const ACH_recirc = ACH * (1 - outsideAir / 100) // ... 1/h
  const vent_fresh = ACH_fresh / 3600 // ... 1/s
  const steril_rate = filterEff * (ACH_recirc / 3600) // 1/s

  const loss_rate = vent_fresh + steril_rate + kappa + lambda
  const loss_rate_co2 = vent_fresh

  co2_exhRate = co2_exhRate / 1000 // ,,, m3/s
  co2_exhRate = co2_exhRate * Math.pow(10, 6) // ...scale to calculate ppm in the end

  // Find minimum and maximum time for each event in seconds
  let t0 = 0
  let tMax = t_max * 60

  // Solver settings
  // const dt = 0.5 * 60; // ... time increment, s
  const dt = tMax / 400 // ... time increment, s

  // Initialisation
  let R = [] // ... Risk over time
  let C = [] // ... concentration vector, PFU/m3
  let Ninh = [] // ... inhaled virus vector, PFU
  let XCO2 = [] // ... CO2 mole fraction vector, ppm
  let peopleOverTime = [] // ... total number of people within room, #
  let infectedPeopleOverTime = [] // ... total number of people within room, #

  let timeSeries = []

  // Custom subroutines
  const createVector = (a1, an, increment = 1) => {
    const vec = []
    for (let i = a1; i <= an; i += increment) {
      vec.push(i)
    }
    return vec
  }

  // New Solver =========================

  timeSeries = createVector(t0, tMax, dt)
  const nBreaks = EH * 2

  const breakLength = timeSeries.length / nBreaks
  let p = true
  let acc = 0
  const breakVector = timeSeries.map(() => {
    if (breakLength < acc) {
      p = !p
      acc = 0
    }
    acc++
    return p
  })

  peopleOverTime = timeSeries.map(
    (t, i) => breakVector[i] * peopleInst(tMax, t).people
  )
  infectedPeopleOverTime = timeSeries.map(
    (t, i) => breakVector[i] * peopleInst(tMax, t).infected
  )

  for (let i = 0; i < timeSeries.length; i++) {
    const t = timeSeries[i]
    const hasPeople = peopleOverTime[i] > 0

    // Virus concentration
    C[i] =
      (hasPeople * peopleInst(tMax, t).infected * N_r) / V / loss_rate +
      ((C[i - 1] || 0) -
        (hasPeople * peopleInst(tMax, t).infected * N_r) / V / loss_rate) *
      Math.exp(-loss_rate * dt)

    // CO2 Concentration
    if (loss_rate_co2 > 0.0) {
      XCO2[i] =
        co2_background +
        (hasPeople * peopleInst(tMax, t).people * co2_exhRate) /
        V /
        loss_rate_co2 +
        ((XCO2[i - 1] || co2_background) -
          (hasPeople * peopleInst(tMax, t).people * co2_exhRate) /
          V /
          loss_rate_co2 -
          co2_background) *
        Math.exp(-loss_rate_co2 * dt)
    } else {
      // account for case where loss_rate_co2 is zero and the previous equation is not defined
      XCO2[i] =
        (XCO2[i - 1] || co2_background) +
        ((hasPeople * peopleInst(tMax, t).people * co2_exhRate) / V) * dt
    }

    // Inhaled virus
    Ninh[i] = (Ninh[i - 1] || 0) + hasPeople * inhRate * dt * C[i]
    R[i] = 1 - Math.exp(-Ninh[i] / riskConst)
  }

  // Final result
  return {
    C,
    R,
    XCO2,
    peopleOverTime,
    infectedPeopleOverTime,
    timeSeries,
    Vperson
  }
}

export { roomCalculation, gaussianDistribution }
