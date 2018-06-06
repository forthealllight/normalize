import { normalize, schema ,denormalize} from './schema/index.js';
const originalData = {
  "id": "123",
  "author":  {
    "uid": "1",
    "name": "Paul"
  },
  "title": "My awesome blog post",
  "comments": {
    total: 100,
    result: [{
        "id": "324",
        "commenter": {
        "uid": "2",
          "name": "Nicole"
        }
    }]
  }
};
const user = new schema.Entity('users', {}, {
  idAttribute: 'uid'
});
// Define your comments schema
const comment = new schema.Entity('comments', {
  commenter: user
});
// Define your article
const article = new schema.Entity('articles', {
  author: user,
  comments: {
    result: [ comment ]
  }
});
const normalizedData = normalize(originalData, article)
//还原范式化数据
const {result,entities}=normalizedData;
const denormalizedData=denormalize(result,article,entities);
console.log(denormalizedData)
