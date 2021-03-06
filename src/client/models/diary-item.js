import moment from 'moment';

import Food from './food';
import DietItem from './diet-item';

const DATE_FORMAT = 'YYYY-MM-DD';

export default class DiaryItem {
  static DATE_FORMAT = DATE_FORMAT;
  static isDateStringValid = isDateStringValid;
  static getNutrients = Food.getNutrients;
  static today = today;
  static getDatesOfWeek = getDatesOfWeek;
  static convertDateToDateString = convertDateToDateString;
  static areNutrientsEmpty = Food.areNutrientsEmpty;

  /**
   * @param {DiaryItem} args
   */
  constructor ({ id, userId, summary, items, date, dateString } = {}) {
    this.id = id;
    this.userId = userId;
    this.summary = summary;
    this.items = items ? items.map(item => new DietItem(item)) : [];

    this.dateString = dateString || moment(new Date()).format(DATE_FORMAT);
    this.date = date ? new Date(date) : new Date(this.dateString);
  }

  getNutrients () {
    return Food.getNutrients(this.items);
  }

  areNutrientsEmpty () {
    return Food.areNutrientsEmpty(this.getNutrients());
  }
}

function isDateStringValid (dateString) {
  const date = moment(dateString, DATE_FORMAT);
  return date.isValid();
}

function today () {
  return moment().format(DATE_FORMAT);
}

function getDatesOfWeek (date) {
  date = typeof date === 'string' ? moment(date, DATE_FORMAT) : moment(date);
  const firstDateOfWeek = moment(date).subtract(date.isoWeekday() - 1, 'days');
  const dateList = [];
  for (let i = 0; i < 7; i++) {
    dateList.push(moment(firstDateOfWeek).add(i, 'days'));
  }
  return dateList;
}

function convertDateToDateString (date) {
  return moment(date).format(DATE_FORMAT);
}
