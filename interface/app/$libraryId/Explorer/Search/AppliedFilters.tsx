import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { forwardRef, useState } from 'react';
import { tw } from '@sd/ui';

import { useSearchContext } from './Context';
import { filterRegistry } from './Filters';
import { getSearchStore, updateFilterArgs, useSearchStore } from './store';
import { RenderIcon } from './util';

export const FilterContainer = tw.div`flex flex-row items-center rounded bg-app-box overflow-hidden shrink-0 h-6`;

export const InteractiveSection = tw.div`flex group flex-row items-center border-app-darkerBox/70 px-2 py-0.5 text-sm text-ink-dull hover:bg-app-lightBox/20`;

export const StaticSection = tw.div`flex flex-row items-center pl-2 pr-1 text-sm`;

export const FilterText = tw.span`mx-1 py-0.5 text-sm text-ink-dull`;

export const CloseTab = forwardRef<HTMLDivElement, { onClick: () => void }>(({ onClick }, ref) => {
	return (
		<div
			ref={ref}
			className="flex h-full items-center rounded-r border-l border-app-darkerBox/70 px-1.5 py-0.5 text-sm hover:bg-app-lightBox/30"
			onClick={onClick}
		>
			<RenderIcon className="h-3 w-3" icon={X} />
		</div>
	);
});

const FiltersOverflowShade = tw.div`from-app-darkerBox/80 absolute w-10 bg-gradient-to-l to-transparent h-6`;

export const AppliedOptions = () => {
	const searchState = useSearchStore();
	const searchCtx = useSearchContext();

	const [scroll, setScroll] = useState(0);

	const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
		const element = e.currentTarget;
		const scroll = element.scrollLeft / (element.scrollWidth - element.clientWidth);
		setScroll(Math.round(scroll * 100) / 100);
	};

	return (
		<div className="relative flex h-full flex-1 items-center overflow-hidden">
			<div
				className="no-scrollbar flex h-full items-center gap-2 overflow-y-auto"
				onScroll={handleScroll}
			>
				{searchCtx.searchQuery && searchCtx.searchQuery !== '' && (
					<FilterContainer>
						<StaticSection>
							<RenderIcon className="h-4 w-4" icon={MagnifyingGlass} />
							<FilterText>{searchCtx.searchQuery}</FilterText>
						</StaticSection>
						<CloseTab onClick={() => searchCtx.setSearchQuery('')} />
					</FilterContainer>
				)}
				{searchCtx.allFilterArgs.map(({ arg, removalIndex }, index) => {
					const filter = filterRegistry.find((f) => f.extract(arg));
					if (!filter) return;

					const activeOptions = filter.argsToOptions(
						filter.extract(arg)! as any,
						searchState.filterOptions
					);

					return (
						<FilterContainer key={`${filter.name}-${index}`}>
							<StaticSection>
								<RenderIcon className="h-4 w-4" icon={filter.icon} />
								<FilterText>{filter.name}</FilterText>
							</StaticSection>
							<InteractiveSection className="border-l">
								{/* {Object.entries(filter.conditions).map(([value, displayName]) => (
                            <div key={value}>{displayName}</div>
                        ))} */}
								{
									(filter.conditions as any)[
										filter.getCondition(filter.extract(arg) as any) as any
									]
								}
							</InteractiveSection>

							<InteractiveSection className="gap-1 border-l border-app-darkerBox/70 py-0.5 pl-1.5 pr-2 text-sm">
								{activeOptions && (
									<>
										{activeOptions.length === 1 ? (
											<RenderIcon
												className="h-4 w-4"
												icon={activeOptions[0]!.icon}
											/>
										) : (
											<div
												className="relative"
												style={{ width: `${activeOptions.length * 12}px` }}
											>
												{activeOptions.map((option, index) => (
													<div
														key={index}
														className="absolute -top-2 left-0"
														style={{
															zIndex: activeOptions.length - index,
															left: `${index * 10}px`
														}}
													>
														<RenderIcon
															className="h-4 w-4"
															icon={option.icon}
														/>
													</div>
												))}
											</div>
										)}
										{activeOptions.length > 1
											? `${activeOptions.length} ${pluralize(filter.name)}`
											: activeOptions[0]?.name}
									</>
								)}
							</InteractiveSection>

							{removalIndex !== null && (
								<CloseTab
									onClick={() => {
										updateFilterArgs((args) => {
											args.splice(removalIndex, 1);

											return args;
										});
									}}
								/>
							)}
						</FilterContainer>
					);
				})}
			</div>

			{scroll > 0.1 && <FiltersOverflowShade className="left-0 rotate-180" />}
			{scroll < 0.9 && <FiltersOverflowShade className="right-0" />}
		</div>
	);
};

function pluralize(word?: string) {
	if (word?.endsWith('s')) return word;
	return `${word}s`;
}

// {
// 	groupedFilters?.map((group) => {
// 		const showRemoveButton = group.filters.some((filter) => filter.canBeRemoved);
// 		const meta = filterRegistry.find((f) => f.name === group.type);

// 		return (
// 			<FilterContainer key={group.type}>
// 				<StaticSection>
// 					<RenderIcon className="h-4 w-4" icon={meta?.icon} />
// 					<FilterText>{meta?.name}</FilterText>
// 				</StaticSection>
// 				{meta?.conditions && (
// 					<InteractiveSection className="border-l">
// 						{/* {Object.values(meta.conditions).map((condition) => (
// 									<div key={condition}>{condition}</div>
// 								))} */}
// 						is
// 					</InteractiveSection>
// 				)}

// 				<InteractiveSection className="border-app-darkerBox/70 gap-1 border-l py-0.5 pl-1.5 pr-2 text-sm">
// 					{group.filters.length > 1 && (
// 						<div
// 							className="relative"
// 							style={{ width: `${group.filters.length * 12}px` }}
// 						>
// 							{group.filters.map((filter, index) => (
// 								<div
// 									key={index}
// 									className="absolute -top-2 left-0"
// 									style={{
// 										zIndex: group.filters.length - index,
// 										left: `${index * 10}px`
// 									}}
// 								>
// 									<RenderIcon className="h-4 w-4" icon={filter.icon} />
// 								</div>
// 							))}
// 						</div>
// 					)}
// 					{group.filters.length === 1 && (
// 						<RenderIcon className="h-4 w-4" icon={group.filters[0]?.icon} />
// 					)}
// 					{group.filters.length > 1
// 						? `${group.filters.length} ${pluralize(meta?.name)}`
// 						: group.filters[0]?.name}
// 				</InteractiveSection>

// 				{showRemoveButton && (
// 					<CloseTab
// 						onClick={() =>
// 							group.filters.forEach((filter) => {
// 								if (filter.canBeRemoved) {
// 									deselectFilterOption(filter);
// 								}
// 							})
// 						}
// 					/>
// 				)}
// 			</FilterContainer>
// 		);
// 	});
// }
