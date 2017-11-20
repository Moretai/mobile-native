import apiService from './../common/services/api.service';

export function getFeed(offset) {
  return apiService.get('api/v1/newsfeed/network/', { offset: offset, limit: 12 })
    .then((data) => {
      return {
        entities: data.activity,
        offset: data['load-next'],
      }
    })
    .catch(err => {
      console.log('error');
      throw "Ooops";
    })
}