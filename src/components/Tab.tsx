import "./Tab.css";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
	faArrowLeft,
	faBars,
	faFile,
	faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAtomValue, useSetAtom } from "jotai";
import { type MouseEventHandler, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
	initializeNoteAtom,
	noteAtom,
	noteThumbnailImageAtom,
	savedNotesAtom,
	saveNoteAtom,
	shouldWarnBeforeLeavingAtom,
	store,
	unsavedChangesAtom,
} from "../atoms";
import { homePath, savedNotesPath } from "../constants";
import { getFirstHeadingOrParagraphText, type Note } from "../utils";
import { Button } from "./Button";
import { NoteStatus } from "./NoteStatus";

export function Tab() {
	const note = useAtomValue(noteAtom);
	const tabViewListRef = useRef<HTMLUListElement | null>(null);
	const initializeNote = useSetAtom(initializeNoteAtom);
	const navigate = useNavigate();
	const location = useLocation();
	const resetScroll = () => {
		if (tabViewListRef.current) {
			tabViewListRef.current.scrollTo({ left: 0 });
		}
	};
	const createNote = () => {
		if (
			!store.get(shouldWarnBeforeLeavingAtom) ||
			window.confirm(
				"Create a new note without saving? " +
					"Any unsaved changes will be lost.",
			)
		) {
			initializeNote();
			navigate(homePath);
			resetScroll();
		}
	};
	const importNote = () => {
		alert("Not implemented");
	};

	return (
		<div className="tab-view">
			<ul className="tab-view-list" ref={tabViewListRef}>
				{location.pathname === homePath && (
					<TabAction
						onClick={() => navigate(savedNotesPath)}
						icon={faBars}
						accessibilityLabel="See saved notes"
					/>
				)}

				{location.pathname === savedNotesPath && (
					<TabAction
						onClick={() => navigate(homePath)}
						icon={faArrowLeft}
						accessibilityLabel="Back to home"
					/>
				)}

				{note && <TabItem note={note} />}

				<TabActionWithLabel
					onClick={createNote}
					icon={faPlus}
					primaryLabel="New"
					secondaryLabel="in browser"
					accessibilityLabel="Create new note in browser"
				/>

				<TabActionWithLabel
					onClick={importNote}
					icon={faFile}
					primaryLabel="Import"
					secondaryLabel="from file"
					accessibilityLabel="Import note from file"
				/>
			</ul>
		</div>
	);
}

interface TabItemProps {
	note: Note;
}

function TabItem({ note }: TabItemProps) {
	const noteTitle = getFirstHeadingOrParagraphText(note.text);
	const thumbnailImage = useAtomValue(noteThumbnailImageAtom);
	const unsavedChanges = useAtomValue(unsavedChangesAtom);
	const savedNote =
		useAtomValue(savedNotesAtom).filter((n) => note && n.id === note.id)[0] ??
		null;
	const saveNote = useSetAtom(saveNoteAtom);

	const save = () => {
		if (
			savedNote === null ||
			note?.id === savedNote.id ||
			window.confirm(
				"You are about to overwrite an existing note. " +
					"Do you want to proceed?",
			)
		) {
			saveNote();
			globalThis.registerToastMessage("saveSuccess");
		}
	};

	const untitled = noteTitle === null;

	return (
		<li className="tab-view-status" key={note.id}>
			<div className="tab-view-item-container">
				{thumbnailImage && (
					<div className="tab-view-item-icon">
						<img
							src={thumbnailImage.url}
							alt={thumbnailImage.alt}
							title={thumbnailImage.title}
						/>
					</div>
				)}

				<div className="tab-view-item-content">
					<div className="tab-view-item-title">
						{untitled ? (
							<span className="tab-view-item-title-untitled">Untitled</span>
						) : (
							<span title={noteTitle}>{noteTitle}</span>
						)}
					</div>

					<div className="tab-view-item-status">
						<NoteStatus note={note} />
					</div>
				</div>

				<div className="tab-view-item-button">
					<Button level="secondary" onClick={save} disabled={!unsavedChanges}>
						Save
					</Button>
				</div>
			</div>
		</li>
	);
}

interface TabActionProps {
	onClick: MouseEventHandler<HTMLButtonElement>;
	icon: IconProp;
	accessibilityLabel: string;
}

function TabAction({ onClick, icon, accessibilityLabel }: TabActionProps) {
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
}

interface TabActionWithLabelProps {
	onClick: MouseEventHandler<HTMLButtonElement>;
	icon: IconProp;
	primaryLabel: string;
	secondaryLabel: string;
	accessibilityLabel: string;
}

function TabActionWithLabel({
	onClick,
	icon,
	primaryLabel,
	secondaryLabel,
	accessibilityLabel,
}: TabActionWithLabelProps) {
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
}
