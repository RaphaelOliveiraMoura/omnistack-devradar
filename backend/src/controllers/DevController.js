import Dev from '../models/Dev';

import github from '../services/github';

import parseStringAsArray from '../utils/parseStringAsArray';

import { findConnections, sendMessage } from '../websocket';

class DevController {
  async index(request, response) {
    const devs = await Dev.find();

    return response.json(devs);
  }

  async store(request, response) {
    const { github_username, techs, latitude, longitude } = request.body;

    const devExists = await Dev.findOne({ github_username });

    if (devExists) {
      return response.status(200).json(devExists);
    }

    const apiResponse = await github.get(`/users/${github_username}`);

    // eslint-disable-next-line no-undef
    const { name = login, bio, avatar_url } = apiResponse.data;

    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    const techsArray = parseStringAsArray(techs);

    const dev = await Dev.create({
      github_username,
      techs: techsArray,
      name,
      bio,
      avatar_url,
      location,
    });

    const sendSocketMessageTo = findConnections({
      coordinates: { latitude, longitude },
      techs: techsArray,
    });

    sendMessage({
      to: sendSocketMessageTo,
      message: 'NEW_DEV',
      data: dev,
    });

    return response.status(201).json(dev);
  }
}

export default new DevController();
