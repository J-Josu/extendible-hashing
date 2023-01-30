<script lang="ts">
  import Directory from '$lib/hashing/components/Directory.svelte';
  import { dataController } from '$lib/hashing/data';
  import { HashDirectory } from '$lib/hashing/directory';
  import { logAsJson } from '$lib/typescript/utils/functions';

  const d = new HashDirectory(4);
  let count = 0;
  const addRecord = () => {
    d.insert(count, dataController.generateData());
    count = count + 1;
  };
  const update = () => {
    logAsJson(d.data.value);
  };
</script>

<button on:click={addRecord}>test</button>
<button on:click={update}>directory data</button>
<Directory state={d.state.asStore} data={d.data.asStore} />

<style>
  button {
    font-size: 2rem;
    padding: 1rem;
  }
</style>
