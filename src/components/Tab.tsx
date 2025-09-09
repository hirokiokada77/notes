import "./Tab.css";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
	faArrowLeft,
	faBars,
	faFile,
	faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	type ChangeEvent,
	type MouseEventHandler,
	useEffect,
	useRef,
} from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { homePath, savedNotesPath } from "../constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
	formatNoteText,
	hasUnsavedChanges,
	initializeActiveNote,
	saveActiveNote,
	selectActiveNote,
	selectActiveNoteThumbnail,
	shouldWarnBeforeLeaving,
	updateActiveNoteText,
} from "../notesSlice";
import { selectStringResources } from "../stringResourcesSlice";
import { updateToastText } from "../toastTextSlice";
import { getNoteTitle, isMarkdownFile, type Note } from "../utils";
import { Button } from "./Button";
import { NoteStatus } from "./NoteStatus";

export const Tab = () => {
	const dispatch = useAppDispatch();
	const stringResources = useSelector(selectStringResources);
	const activeNote = useAppSelector(selectActiveNote);
	const tabViewListRef = useRef<HTMLUListElement | null>(null);
	const navigate = useNavigate();
	const location = useLocation();
	const shouldWarn = useAppSelector(shouldWarnBeforeLeaving);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const resetScroll = () => {
		if (tabViewListRef.current) {
			tabViewListRef.current.scrollTo({ left: 0 });
		}
	};

	const handleCreateButtonClick = () => {
		if (
			!shouldWarn ||
			window.confirm(stringResources["promptMessages/unsavedChanges"])
		) {
			dispatch(initializeActiveNote());
			navigate(homePath);
			resetScroll();
		}
	};

	const handleImportButtonClick = () => {
		if (
			!shouldWarn ||
			window.confirm(stringResources["promptMessages/unsavedChanges"])
		) {
			fileInputRef.current!.click();
		}
	};

	const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			const selectedFile = event.target.files[0];
			if (isMarkdownFile(selectedFile.name)) {
				const reader = new FileReader();
				reader.onload = async (event) => {
					if (event.target) {
						const fileContent = event.target.result as string;
						dispatch(initializeActiveNote());
						dispatch(updateActiveNoteText(fileContent, null));
						navigate(homePath);
						await dispatch(formatNoteText());
						dispatch(updateToastText("toastMessages/fileLoadSuccess"));
					}
				};
				reader.readAsText(selectedFile);
			} else {
				dispatch(updateToastText("toastMessages/fileNotMarkdown"));
			}
		}
	};

	useEffect(() => {
		const handleKeyDown = async (event: KeyboardEvent) => {
			// Save
			if ((event.ctrlKey || event.metaKey) && event.key === "s") {
				event.preventDefault();
				if (activeNote) {
					await dispatch(formatNoteText());
					dispatch(saveActiveNote());
					dispatch(updateToastText("toastMessages/saveSuccess"));
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [dispatch, activeNote]);

	return (
		<div className="tab-view">
			<ul className="tab-view-list" ref={tabViewListRef}>
				{location.pathname === homePath && (
					<TabAction
						onClick={() => navigate(savedNotesPath)}
						icon={faBars}
						accessibilityLabel={stringResources["pageTitles/savedNotes"]}
					/>
				)}

				{location.pathname === savedNotesPath && (
					<TabAction
						onClick={() => navigate(homePath)}
						icon={faArrowLeft}
						accessibilityLabel={stringResources["pageTitles/home"]}
					/>
				)}

				{activeNote && <TabItem note={activeNote} />}

				<TabActionWithLabel
					onClick={handleCreateButtonClick}
					icon={faPlus}
					primaryLabel={stringResources["buttonLabels/create"]}
					secondaryLabel={stringResources["buttonSubLabels/create"]}
					accessibilityLabel={stringResources["accessibilityLabels/create"]}
				/>

				<TabActionWithLabel
					onClick={handleImportButtonClick}
					icon={faFile}
					primaryLabel={stringResources["buttonLabels/import"]}
					secondaryLabel={stringResources["buttonSubLabels/import"]}
					accessibilityLabel={stringResources["accessibilityLabels/import"]}
				/>
			</ul>

			<input
				type="file"
				ref={fileInputRef}
				hidden
				onChange={handleFileInputChange}
			/>
		</div>
	);
};

interface TabItemProps {
	note: Note;
}

const TabItem = ({ note }: TabItemProps) => {
	const dispatch = useAppDispatch();
	const noteTitle = getNoteTitle(note.text);
	const thumbnail = useAppSelector(selectActiveNoteThumbnail);
	const stringResources = useSelector(selectStringResources);

	const handleSaveButtonClick = () => {
		dispatch(saveActiveNote());
		dispatch(updateToastText("toastMessages/saveSuccess"));
	};

	return (
		<li className="tab-view-status">
			<div className="tab-view-item-container">
				{thumbnail && (
					<div className="tab-view-item-icon">
						<img
							src={thumbnail.url}
							alt={thumbnail.alt}
							title={thumbnail.title}
						/>
					</div>
				)}

				<div className="tab-view-item-content">
					<div className="tab-view-item-title">
						{noteTitle ? (
							<span title={noteTitle}>{noteTitle}</span>
						) : (
							stringResources["statusMessages/untitled"]
						)}
					</div>

					<div className="tab-view-item-status">
						<NoteStatus note={note} />
					</div>
				</div>

				<div className="tab-view-item-button">
					<Button
						level="secondary"
						onClick={handleSaveButtonClick}
						disabled={!useAppSelector(hasUnsavedChanges)}
					>
						{stringResources["buttonLabels/save"]}
					</Button>
				</div>
			</div>
		</li>
	);
};

interface TabActionProps {
	onClick: MouseEventHandler<HTMLButtonElement>;
	icon: IconProp;
	accessibilityLabel: string;
}

const TabAction = ({ onClick, icon, accessibilityLabel }: TabActionProps) => {
	return (
		<li className="tab-view-action tab-view-action-with-no-label">
			<button
				className="tab-view-item-container"
				type="button"
				onClick={onClick}
				title={accessibilityLabel}
			>
				<div className="tab-view-item-icon">
					<FontAwesomeIcon icon={icon} />
				</div>
			</button>
		</li>
	);
};

interface TabActionWithLabelProps {
	onClick: MouseEventHandler<HTMLButtonElement>;
	icon: IconProp;
	primaryLabel: string;
	secondaryLabel: string;
	accessibilityLabel: string;
}

const TabActionWithLabel = ({
	onClick,
	icon,
	primaryLabel,
	secondaryLabel,
	accessibilityLabel,
}: TabActionWithLabelProps) => {
	return (
		<li className="tab-view-action tab-view-action-with-label">
			<button
				className="tab-view-item-container"
				type="button"
				onClick={onClick}
				title={accessibilityLabel}
			>
				<div className="tab-view-item-icon">
					<FontAwesomeIcon icon={icon} />
				</div>

				<div className="tab-view-item-content">
					<div className="tab-view-item-title">{primaryLabel}</div>
					<div className="tab-view-item-status">{secondaryLabel}</div>
				</div>
			</button>
		</li>
	);
};
