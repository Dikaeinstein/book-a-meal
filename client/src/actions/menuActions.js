import { normalize } from 'normalizr';
import menuService from '../helpers/menuService';
import config from '../config';
import axiosErrorWrapper from '../helpers/axiosErrorWrapper';
import { menuSchema } from './schema';
import {
  FETCH_MENU_SUCCESS,
  FETCH_MENU_REQUEST,
  FETCH_MENU_ERROR,
  SETUP_MENU_ERROR,
  SETUP_MENU_REQUEST,
  SETUP_MENU_SUCCESS,
  UPDATE_MENU_REQUEST,
  UPDATE_MENU_ERROR,
  UPDATE_MENU_SUCCESS,
} from '../constants/menuActionTypes';


/* eslint consistent-return: 0 */

/**
 * Fetch menu success action creator
 *
 * @export
 * @param {Object} response Normalized menu response
 *
 * @returns {Object} Redux action
 */
const fetchMenuSuccess = response => ({
  type: FETCH_MENU_SUCCESS,
  response,
});

/**
 * Fetch menu error action creator
 *
 * @export
 * @param {String} error Error message
 *
 * @returns {object} Redux action
 */
const fetchMenuError = error => ({
  type: FETCH_MENU_ERROR,
  message: error,
});

/**
 * Fetch menu async action creator
 *
 * @export
 *
 * @returns {Function}
 */
export const fetchMenu = () => async (dispatch, getState) => {
  if (getState().menu.isFetching) {
    return Promise.resolve();
  }

  dispatch({ type: FETCH_MENU_REQUEST });
  try {
    const menu = await menuService.getMenu(`${config.API_BASE_URL}/api/v1/menu/`);
    dispatch(fetchMenuSuccess(normalize(menu, menuSchema)));
  } catch (error) {
    dispatch(fetchMenuError(axiosErrorWrapper(error, dispatch)));
  }
};

/**
 * Setup menu success action creator
 *
 * @export
 * @param {Object} response Normalized menu response
 *
 * @returns {Object} Redux action
 */
const setupMenuSuccess = response => ({
  type: SETUP_MENU_SUCCESS,
  response,
});

/**
 * Setup menu error action creator
 *
 * @export
 * @param {String} error Error message
 *
 * @returns {Object} Redux action
 */
const setupMenuError = error => ({
  type: SETUP_MENU_ERROR,
  message: error,
});

/**
 * Setup menu async action creator
 *
 * @export
 * @param {Object} values
 *
 * @returns {Function}
 */
export const setupMenu = values => async (dispatch, getState) => {
  if (getState().menu.isSaving) {
    return Promise.resolve();
  }

  dispatch({ type: SETUP_MENU_REQUEST });
  try {
    const menu = await menuService
      .setMenu(`${config.API_BASE_URL}/api/v1/menu/`, values);
    dispatch(setupMenuSuccess(normalize(menu, menuSchema)));
  } catch (error) {
    dispatch(setupMenuError(axiosErrorWrapper(error, dispatch)));
  }
};

/**
 * Update menu success action creator
 *
 * @export
 * @param {Object} response Normalized menu response
 *
 * @returns {object} Redux action
 */
const updateMenuSuccess = response => ({
  type: UPDATE_MENU_SUCCESS,
  response,
});

/**
 * Update menu error action creator
 *
 * @export
 * @param {String} error Error message
 *
 * @returns {Object} Redux action
 */
const updateMenuError = error => ({
  type: UPDATE_MENU_ERROR,
  message: error,
});

/**
 * Update menu async action creator
 *
 * @export
 * @param {object} values
 * @param {Number} menuId
 *
 * @returns {Function}
 */
export const updateMenu = (values, menuId) => async (dispatch, getState) => {
  if (getState().menu.isUpdating) {
    return Promise.resolve();
  }

  dispatch({ type: UPDATE_MENU_REQUEST });
  try {
    const menu = await menuService
      .updateMenu(`${config.API_BASE_URL}/api/v1/menu/${menuId}`, values);
    dispatch(updateMenuSuccess(normalize(menu, menuSchema)));
  } catch (error) {
    dispatch(updateMenuError(axiosErrorWrapper(error, dispatch)));
  }
};
