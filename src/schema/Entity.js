export default class EntitySchema {
  constructor(name, entityParams={},entityConfig={}) {
    const idAttribute=entityConfig.idAttribute||'id';
    this.name = name;
    this.idAttribute = idAttribute;
    this.init(entityParams);
  }
  /**
   * [获取当前schema的名字]
   * @return {[type]} [description]
   */
  getName() {
    return this.name;
  }
  getId(input) {
    let key=this.idAttribute;
    return input[key];
  }
  /**
   * [遍历当前schema中的entityParam，entityParam中可能存在schema]
   * @param  {[type]} entityParams [description]
   * @return {[type]}              [description]
   */
  init(entityParams) {
    if(!this.schema){
      this.schema={}
    }
    for (let key in entityParams) {
      if (entityParams.hasOwnProperty(key)) {
        this.schema[key] = entityParams[key];
      }
    }
  }
}
