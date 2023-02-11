import { IWarehouse } from '../../model';
import { StateActionBase } from '../../model/state';

export abstract class UserAction extends StateActionBase {
  constructor(private warehouse: IWarehouse) {
    super();
  }
}
