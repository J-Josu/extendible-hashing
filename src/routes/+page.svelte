<script lang="ts">
  import Incrementer from '../../archived/components/Incrementer.svelte';
  import Toolbar from '../../archived/components/Toolbar.svelte';
  // import Record from '../../archived/components/Record.svelte';
  // import { HashRecord } from '$lib/ts-test/record';
  // import NewRecord from '$lib/secondDay/NewRecord.svelte';
  const test = { val1: 5, val2: 0 };
  // const record = new HashRecord(1, test);
  const test2 = {
    val1: 1,
    data: {
      num: 9
    }
  }
  
</script>

<Toolbar />
<!-- <Incrementer /> -->
<!-- <Record {record} /> -->
<button on:click={() => ++test2.data.num}>test</button>
<!-- <NewRecord record={test2} /> -->
{test.val1}
