import {it,expect} from 'vitest';
import {NativeMaterialController} from '../src/native';
it('releases a closed popout without retaining or resetting it again on plugin unload',()=>{
 const controller=new NativeMaterialController(),calls:string[]=[];
 let destroyed=false;const popout={setBackgroundMaterial:(m:string)=>calls.push(m),isDestroyed:()=>destroyed};
 controller.apply(popout,'mica',true);destroyed=true;controller.release(popout);
 destroyed=false;controller.dispose();expect(calls).toEqual(['mica']);
});
