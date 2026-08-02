import { mount } from 'svelte';
import { APP_MOUNT_ID, parsePageInit } from '$contracts/page';
import App from './App.svelte';

const target = document.getElementById(APP_MOUNT_ID);

if (target instanceof HTMLElement) {
  const init = parsePageInit(target.dataset.pageInit);

  if (init) {
    target.replaceChildren();
    mount(App, { target, props: { init } });
  } else {
    target.dataset.mountError = 'invalid-initialization';
  }
}
