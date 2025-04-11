<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";
	import Ellipsis from "@lucide/svelte/icons/ellipsis";
	import Pencil from "@lucide/svelte/icons/pencil";
	import SquareArrowOutUpRight from "@lucide/svelte/icons/square-arrow-out-up-right";
	import Trash2 from "@lucide/svelte/icons/trash-2";

	let {
		feeds,
	}: {
		feeds: {
			name: string;
			url: string;
			// This should be `Component` after @lucide/svelte updates types
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			icon: any;
		}[];
	} = $props();

	const sidebar = useSidebar();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
	<Sidebar.GroupLabel>My Recent Feeds</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each feeds as item (item.name)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton>
					{#snippet child({ props })}
						<a href={item.url} {...props}>
							<item.icon />
							<span>{item.name}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuAction showOnHover {...props}>
								{#snippet child({ props })}
									<a href="/feeds" {...props}>
										<Ellipsis />
										<span class="sr-only">More</span>
									</a>
								{/snippet}
							</Sidebar.MenuAction>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						class="w-48"
						side={sidebar.isMobile ? "bottom" : "right"}
						align={sidebar.isMobile ? "end" : "start"}
					>
						<DropdownMenu.Item>
							<Pencil class="text-muted-foreground" />
							<span>Edit feed</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<SquareArrowOutUpRight class="text-muted-foreground" />
							<span>View on Bluesky</span>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item>
							<Trash2 class="text-muted-foreground" />
							<span>Delete feed</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		{/each}
		<Sidebar.MenuItem>
			<Sidebar.MenuButton>
				{#snippet child({ props })}
					<a href="/feeds" {...props}>
						<Ellipsis />
						<span>More</span>
					</a>
				{/snippet}
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
</Sidebar.Group>
