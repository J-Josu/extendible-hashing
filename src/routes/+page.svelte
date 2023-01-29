<script lang="ts">
  import Directory from '$lib/hashing/components/Directory.svelte';
  import { dataController } from '$lib/hashing/data';
  import { HashDirectory } from '$lib/hashing/directory';
  import { HashRecord } from '$lib/hashing/record';
  import { logAsJson } from '$lib/utils/funtions';

  const d = new HashDirectory(4);
  let count = 98;
  const addRecord = () => {
    d.insert(count, new HashRecord(count, dataController.generateData()));
    count+=1;
  };
  const update = () => {
    logAsJson(d.data.value);
  };
</script>

<button on:click={addRecord}>test</button>
<button on:click={update}>test</button>
<Directory state={d.state.asStore} data={d.data.asStore} />

<style>
  button {
    font-size: 2rem;
    padding: 1rem;
  }
</style>
