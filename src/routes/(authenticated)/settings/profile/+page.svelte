<script lang="ts">
    import type { PageData } from './$types';
    import { Separator } from "$lib/components/ui/separator/index.js";	
	import ProfileForm from './profile-form.svelte';

    let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Profile</h3>
		<p class="text-muted-foreground text-sm">
            Update your profile information and manage your account settings.
		</p>
	</div>

    <Separator />
    <ProfileForm data={data.form} />
</div>