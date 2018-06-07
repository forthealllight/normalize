import {normalize,schema,denormalize} from './schema/index.js';
//范式化数据用例，原始数据
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
}
//范式化数据用例，范式化后的结果数据
const normalizedData={
  result: "123",
  entities: {
    "articles": {
      "123": {
        id: "123",
        author: "1",
        title: "My awesome blog post",
        comments: {
    	total: 100,
    	result: [ "324" ]
        }
      }
    },
    "users": {
      "1": { "uid": "1", "name": "Paul" },
      "2": { "uid": "2", "name": "Nicole" }
    },
    "comments": {
      "324": { id: "324", "commenter": "2" }
    }
 }
}
//开始测试上述用例下的，范式化结果对比
test('test originalData to normalizedData', () => {
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
  const data = normalize(originalData, article);
  expect(data).toEqual(normalizedData);
});
//开始测试上述例子，反范式化的结果对比
test('test normalizedData to originalData',()=>{
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
  const data = normalize(originalData, article)
  //还原范式化数据
  const {result,entities}=data;
  const denormalizedData=denormalize(result,article,entities);
  expect(denormalizedData).toEqual(originalData)
})
