import { ActionContext } from "vuex";
import { getContract, setup, PROVIDERS_CONFIG } from "./core";

export function solidoAction<T>(
  action: <S, R>(context: ActionContext<S, R>, payload: any) => T
) {
  return <S, R>(context: ActionContext<S, R>, payload: any) => {
    context.setup = setup<S, R>(context);
    context.getContract = getContract(context);
    context.currentConfig = PROVIDERS_CONFIG;
    return action(context, payload);
  };
}
