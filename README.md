# Vuex Solido

Vuex Solido allows to add [@decent-bet/solido](https://github.com/decent-bet/solido) capabilities to vuex. It consist for now in an enhanced action that add three new parameters to every action created based on it. 

- `setup()`: recieve all the settings needed.
- `getContract()`: return a contract instance of a class based on [@decent-bet/solido](https://github.com/decent-bet/solido).
- `currentConfig`: an object that store the config initially passed to the setup method, check the interface [SolidoProviderConfig](/src/types.ts#L12).

### Getting started

> Install: `npm i --save @decent-bet/vuex-solido`
> Follow the instructions to use the decorators from [@decent-bet/solido](https://github.com/decent-bet/solido#readme).

### Using the enhanced action
> Frist of all you need to add some mutations to your store or module of your store:
``` typescript
  import { solidoMutations } from '@decent-bet/vuex-solido';

  ...
   mutations: {
     // your mutations
     ...solidoMutations
   },
   ...
```

> Setup:
- ***You should call `setup()` before any access to `currentConfig` or call to `getContract()`***
- You should get all the settings needed to create a `SolidoModule`;

``` typescript
import { ActionContext } from 'vuex';
import { ConnexPlugin, ContractProviderMapping } from "@decent-bet/solido";
import { solidoAction, SolidoProviderConfig } from '@decent-bet/vuex-solido';
import { MySubState } from './MySubState'; // use your own state definitions
import { MyRootState } from './MyRootState'; // use your own state definitions
import { MyContract } from './MyContract';  // created using @decent-bet/solido.
import { MyContractImport } from './MyContractImport';

// the solidoAction receive a type of the return, in this case Promise<void>, 
// the second param is a function and can be awaitable like in this case  
const setupWallet = solidoAction<Promise<void>>(async <MySubState, MyRootState>(
  context: ActionContext<MySubState, MyRootState>) => {
  const {
    commit,
    setup
  } = context;

  // get all the config needed, in this case we are using vechain connex and comet from https://www.totientlabs.com/
  const { thor, connex } = window;
  if(!thor || !connex) {
    throw new Error('Thor or connex not found.')
  }
  try {
    const cometResult = await thor.enable();
    const [defaultAccount] = cometResult;
    const _ = await connex.thor.block(0).get();
    const { id } = connex.thor.genesis;
    const chainTag = `0x${id.substring(id.length - 2, id.length)}`;

    const config: SolidoProviderConfig = {
      connex: {
        connex,
        chainTag,
        defaultAccount
      }
    };
    const contractMappings: ContractProviderMapping[] = [{
          name: 'MyTokenContract',
          import: MyContractImport,
          entity: MyContract,
    }];

    setup(config, contractMappings, ConnexPlugin);

    commit('YOUR_WALLET_SETUP_MUTATION', { success: true });
  } catch(error) {
    // User rejected provider access
    console.error(error)
    commit('YOUR_WALLET_SETUP_MUTATION', { success: false });
  }

});
```

> Access to the wallet info:
``` typescript
// get the wallet info, you only be able to access the currentConfig after call to setup() method
const setupWallet = solidoAction<Promise<void>>(<MySubState, MyRootState>(
  context: ActionContext<MySubState, MyRootState>, balance?: any
) => {
  const {
    commit,
    currentConfig // {SolidoProviderConfig}
  } = context;

  // access to the public address and the networkIdentifier (networkId for Ethereum and chainTag for Vechain/Thor)
  const { connex } = currentConfig;
  console.log(`My address is: ${connex.defaultAccount} and the chainTag is: ${chainTag}`);
  commit('YOUR_WALLET_CONFIG_MUTATION', connex);
});
```

> Get a contract and call to a method:
``` typescript
// get any created contract based on @decent-bet/solido
const getBalance = solidoAction<Promise<void>>(async <MySubState, MyRootState>(
  context: ActionContext<MySubState, MyRootState>, balance?: any
) => {
  const {
    commit,
    getContract
  } = context;

  // get the class instace of MyContract class
  const contract = getContract<MyContract>('MyTokenContract');
  const balance = await contract.myBalance();

  commit('SET_BALANCE', balance);
});

```

