import EntitySchema from './Entity.js';
const flatten = (value, schema, addEntity) => {
  if (typeof schema.getName==='undefined') {
    return noSchemaNormalize(schema, value,flatten, addEntity);
  }
  return schemaNormalize(schema,value,flatten, addEntity);
};
/**
 * [如果传入的schema是一个schema的实例，那么可以执行此函数]
 * @param  {[type]} schema    [description]
 * @param  {[type]} data     [description]
 * @param  {[type]} flatten     [description]
 * @param  {[type]} addEntity [description]
 * @return {[type]}           [description]
 */
const schemaNormalize=(schema,data,flatten,addEntity)=>{
  const processedEntity = {...data};
  const currentSchema=schema;
  Object.keys(currentSchema.schema).forEach((key) => {
      const schema = currentSchema.schema[key];
      const temple= flatten(processedEntity[key], schema, addEntity);
      // console.log(key,temple);
      processedEntity[key] =temple;
  });
  addEntity(currentSchema, processedEntity);
  return currentSchema.getId(data);
}
/**
 * [如果传入的schema不是schema的实例，那么执行此方法]
 * @param  {[type]} schema    [description]
 * @param  {[type]} data     [description]
 * @param  {[type]} flatten     [description]
 * @param  {[type]} addEntity [description]
 * @return {[type]}           [description]
 */
const noSchemaNormalize = (schema, data, flatten, addEntity) => {
  //非schema实例要分别针对对象类型和数组类型做不同的处理
  const object = { ...data };
  const arr=[];
  let tag=schema instanceof Array;
  Object.keys(schema).forEach((key) => {
    if(tag){
      const localSchema=schema[key];
      const value=flatten(data[key],localSchema,addEntity);
      arr.push(value);
    }else{
      const localSchema = schema[key];
      const value = flatten(data[key],localSchema,addEntity);
      object[key] = value;
    }
  });
  //根据判别的结果，返回不同的值，可以是对象，也可以是数组
  if(tag){
    return arr
  }else{
    return object;
  };
};
/**
 * [添加属性，递归到每一个schema，不过不是schema则已原来的形式（对象属性形式直接）]
 * @param {[type]} entities [description]
 */
const addEntities = (entities) => (schema, processedEntity) => {
  const schemaKey = schema.getName();
  const id = schema.getId(processedEntity);
  if (!(schemaKey in entities)) {
    entities[schemaKey] = {};
  }
  const existingEntity = entities[schemaKey][id];
  if (existingEntity) {
    entities[schemaKey][id] = Object.assgin(existingEntity,processedEntity);
  } else {
    entities[schemaKey][id] = processedEntity;
  }
};
/**
 * [暴露给外界使用的normilize方法]
 * @param  {[type]} data  [description]
 * @param  {[type]} schema [description]
 * @return {[type]}        [description]
 */
export const normalize = (data, schema) => {

  const entities = {};
  const addEntity = addEntities(entities);

  const result = flatten(data, schema, addEntity);
  return { entities, result };
};
//暴露出schema对象，内涵Entity的构造方法
export const schema = {
  Entity: EntitySchema
};
/**
 * [传入的是schema实例情况下的拉平函数]
 * @param  {[type]} id        [description]
 * @param  {[type]} schema    [description]
 * @param  {[type]} unflatten [description]
 * @param  {[type]} getEntity [description]
 * @param  {[type]} cache     [description]
 * @return {[type]}           [description]
 */
const unflattenEntity = (id, schema, unflatten, getEntity, cache) => {
  const entity = getEntity(id, schema);
  if(!cache[schema.getName()]){
    cache[schema.getName()]={}
  }
  if (!cache[schema.getName()][id]) {
    const entityCopy =  { ...entity };
    //递归的方法，存在schema嵌套的情况下要一级接着一级的往下递归到根部
    Object.keys(schema.schema).forEach((key) => {
      if (entityCopy.hasOwnProperty(key)) {
        const uschema = schema.schema[key];
        entityCopy[key] = unflatten(entityCopy[key], uschema);
      }
    });
    cache[schema.getName()][id] = entityCopy;
  }
  return cache[schema.getName()][id];
};
/**
 * [传入的已经不是schema实例情况下的拉平函数]
 * @param  {[type]} schema    [description]
 * @param  {[type]} input     [description]
 * @param  {[type]} unflatten [description]
 * @return {[type]}           [description]
 */
const unflattenNoEntity=(schema, input, unflatten) => {
  const object = { ...input };
  const arr=[];
  let tag=schema instanceof Array;
  //同样的要针对数组和非数组的情况进行判别哦
  Object.keys(schema).forEach((key) => {
    if(tag){
      if (object[key]) {
        object[key] = unflatten(object[key], schema[key]);
      }
      arr.push(unflatten(object[key], schema[key]))
    }else{
      if (object[key]) {
        object[key] = unflatten(object[key], schema[key]);
      }
    }
  });
  if(tag){
    return arr
  }
  return object;
};


const getUnflatten = (entities) => {
  const cache = {};
  const getEntity = getEntities(entities);
  return function unflatten(data, schema) {
    if (typeof schema.getName==='undefined') {
      return unflattenNoEntity(schema, data, unflatten);
    }
    return unflattenEntity(data, schema, unflatten, getEntity, cache);
  };
};
/**
 * [传入的是entities,这样可以获取对应schema的某个id所对应的对象]
 * @param  {[type]} entities [description]
 * @return {[type]}          [description]
 */
const getEntities = (entities) => {
  return (entityOrId, schema) => {
    const schemaKey = schema.getName();
    if (typeof entityOrId === 'object') {
      return entityOrId;
    }
    return entities[schemaKey][entityOrId];
  };
};

export const denormalize = (result, schema, entities) => getUnflatten(entities)(result,schema);
