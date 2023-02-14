import { IWarehouse, StateActionBase } from '@/model';

export abstract class UserAction extends StateActionBase {
  constructor(private warehouse: IWarehouse) {
    super();
  }
}
