<script lang="ts">
  import Directory from '$lib/hashing/components/Directory.svelte';
  import { HashDirectory } from '$lib/hashing/directory';
  import { HashRecord } from '$lib/hashing/record';
  import { logAsJson } from '$lib/utils/funtions';
  // import Record from '../../archived/components/Record.svelte';
  // import { HashRecord } from '$lib/ts-test/record';
  // import NewRecord from '$lib/secondDay/NewRecord.svelte';
  const test = { val1: 5, val2: 0 };
  // const record = new HashRecord(1, test);
  const test2 = {
    val1: 1,
    data: {
      num: 9,
    },
  };
  const d = new HashDirectory<{ id: number; double: number }>(4);
  let count = 98;
  const addRecord = () => {
    d.insert(count, new HashRecord(count, { id: count, double: count * 2 }));
    count++;
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
