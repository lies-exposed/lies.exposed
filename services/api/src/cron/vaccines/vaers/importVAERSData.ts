// import * as t from 'io-ts'

// export const VAERSVAX = t.strict(
//   {
//     VAERS_ID: t.string,
//     VAX_TYPE: t.string,
//     VAX_MANU: t.string,
//     VAX_LOT: t.string,
//     VAX_DOSE_SERIES: t.string,
//     VAX_ROUTE: t.string,
//     VAX_SITE: t.string,
//     VAX_NAME: t.string
//   },
//   "VAERSVAX"
// );

// export const VAERSSYMPTOM = t.strict(
//   {
//     VAERS_ID: t.string,
//     SYMPTOM1: t.string,
//     SYMPTOM2: t.string,
//     SYMPTOM3: t.string,
//     SYMPTOM4: t.string,
//     SYMPTOM5: t.string
//   },
//   "VAERSSymptom"
// );

// const VAERSDATA = t.strict({
//   VAERS_ID: t.union([t.undefined, t.string]),
//   RECVDATE: t.union([t.undefined, t.string]),
//   STATE: t.union([t.undefined, t.string]),
//   AGE_YRS: t.union([t.undefined, t.string]),
//   CAGE_YR: t.union([t.undefined, t.string]),
//   CAGE_MO: t.union([t.undefined, t.string]),
//   SEX: t.union([t.undefined, t.string]),
//   RPT_DATE: t.union([t.undefined, t.string]),
//   SYMPTOM_TEXT: t.union([t.undefined, t.string]),
//   DIED: t.union([t.undefined, t.string]),
//   DATEDIED: t.union([t.undefined, t.string]),
//   L_THREAD: t.union([t.undefined, t.string]),
//   ER_VISIT: t.union([t.undefined, t.string]),
//   HOSPITAL: t.union([t.undefined, t.string]),
//   HOSPDAYS: t.union([t.undefined, t.string]),
//   X_STAY: t.union([t.undefined, t.string]),
//   DISABLE: t.union([t.undefined, t.string]),
//   RECOVD: t.union([t.undefined, t.string]),
//   VAX_DATE: t.union([t.undefined, t.string]),
//   ONSET_DATE: t.union([t.undefined, t.string]),
//   NUMDAYS: t.union([t.undefined, t.string]),
//   LAB_DATA: t.union([t.undefined, t.string]),
//   V_ADMINBY: t.union([t.undefined, t.string]),
//   V_FUNDBY: t.union([t.undefined, t.string]),
//   OTHER_MEDS: t.union([t.undefined, t.string]),
//   CUR_ILL: t.union([t.undefined, t.string]),
//   HISTORY: t.union([t.undefined, t.string]),
//   PRIOR_VAX: t.union([t.undefined, t.string]),
//   SPLITTYPE: t.union([t.undefined, t.string]),
//   FORM_VERS: t.union([t.undefined, t.string]),
//   TODAYS_DATE: t.union([t.undefined, t.string]),
//   BIRTH_DEFECT: t.union([t.undefined, t.string]),
//   OFC_VISIT: t.union([t.undefined, t.string]),
//   ER_ED_VISIT: t.union([t.undefined, t.string]),
//   ALLERGIES: t.union([t.undefined, t.string])
// });

// type VAERSDATA = t.TypeOf<typeof VAERSDATA>;