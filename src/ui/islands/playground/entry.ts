import { mount } from 'svelte';
import {
  parsePlaygroundInit,
  PLAYGROUND_MOUNT_ID,
} from '$contracts/playground';
import Playground from './Playground.svelte';

const target = document.getElementById(PLAYGROUND_MOUNT_ID);

if (target instanceof HTMLElement) {
  const init = parsePlaygroundInit(target.dataset.playgroundInit);

  if (init) {
    target.replaceChildren();
    mount(Playground, { target, props: { init } });
  } else {
    target.dataset.mountError = 'invalid-initialization';
  }
}
